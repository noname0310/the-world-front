import { Vector3 } from "three";
import { Server } from "../../connect/types";
import { Component } from "../../engine/hierarchy_object/Component";
import { GameObject } from "../../engine/hierarchy_object/GameObject";
import { PrefabRef } from "../../engine/hierarchy_object/PrefabRef";
import { NetworkImagePrefab } from "../../prefab/NetworkImagePrefab";
import { IGridCollidable } from "../physics/IGridCollidable";
import { CameraRelativeZaxisSorter } from "../render/CameraRelativeZaxisSorter";
import { ZaxisSorter } from "../render/ZaxisSorter";

const PREFIX = "@@tw/game/component/gamemanager/NetworkImageManager";
const flatTypes = new Set([Server.GameObjectType.Floor, Server.GameObjectType.Effect]);

export class NetworkImageManager extends Component {
    private _networkImageMap: Map<number, GameObject> = new Map();

    private _iGridCollidable: IGridCollidable | null = null;
    private _imageList: Server.ImageGameObject[] = [];

    public set iGridCollidable(val: IGridCollidable | null) {
        this._iGridCollidable = val;
    }

    public set imageList(val: Server.ImageGameObject[]) {
        this._imageList = [...val];
    }

    public start() {
        this._imageList.forEach(info => this.addOneImage(info));
    }

    public addOneImage(info: Server.ImageGameObject) {
        
        this._imageList.push(info);
        this._buildNetworkImage(info);
    }

    private _buildNetworkImage(imageInfo: Server.ImageGameObject) {
        const instantlater = this.engine.instantlater;
        const prefabRef = new PrefabRef<GameObject>();
        const gcx = this._iGridCollidable?.gridCenterX || 8;
        const gcy = this._iGridCollidable?.gridCenterY || 8;
        const gw = this._iGridCollidable?.gridCellWidth || 16;
        const gh = this._iGridCollidable?.gridCellHeight || 16;
        const calculated =  new Vector3(
            gcx + imageInfo.x * gw - gw / 2,
            gcy + imageInfo.y * gh - gh / 2, 1);
        
        const prefab = 
            instantlater.buildPrefab(`${PREFIX}/image_${imageInfo.id}`, NetworkImagePrefab, calculated)
                .withGridInfo(new PrefabRef(this._iGridCollidable))
                .withImageInfo(new PrefabRef(imageInfo));
        
        const builder = prefab.make();
        builder.getGameObject(prefabRef);
        this._networkImageMap.set(imageInfo.id, prefabRef.ref!);
        this.gameObject.addChildFromBuilder(builder);

        // Put soter after build
        if (flatTypes.has(imageInfo.type)) {
            const c = prefabRef.ref!.addComponent(CameraRelativeZaxisSorter);
            if (!c) throw new Error("fail to add");
            c.offset =
                (imageInfo.type === Server.GameObjectType.Effect) ? 100 :
                (imageInfo.type === Server.GameObjectType.Floor)  ? -500 :
                0;
        }
        else {
            const c = prefabRef.ref!.addComponent(ZaxisSorter);
            if (!c) throw new Error("fail to add");

            c.runOnce = true;
        }
    }
}
