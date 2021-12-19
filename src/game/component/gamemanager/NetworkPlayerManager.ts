import { Vector2 } from "three";
import { Component } from "../../engine/hierarchy_object/Component";
import { GameObject } from "../../engine/hierarchy_object/GameObject";
import { PrefabRef } from "../../engine/hierarchy_object/PrefabRef";
import { NetworkManager, User } from "../../engine/NetworkManager";
import { NetworkPlayerPrefab } from "../../prefab/NetworkPlayerPrefab";
import { PlayerGridMovementController } from "../controller/PlayerGridMovementController";

const prefix = `@@tw/game/component/spawner/NetworkSpawnner`

export class NetworkPlayerManager extends Component {
    private _networkPlayerMap: Map<string, GameObject> = new Map();
    private _networkManager: NetworkManager | null = null;

    public initNetwork(networkManager: NetworkManager) {
        this._networkManager = networkManager;
        networkManager.ee.on('join', (user, pos) => {
            this._buildNetworkPlayer(user, pos, networkManager);
        });
    }

    public initLocalPlayer(player: GameObject){
        const component = player.getComponent(PlayerGridMovementController)
        if (!component) throw new Error("no PlayerGridMovementController component");
        
        component.addOnMoveToTargetEventListener((x, y) => {
            this._networkManager!.ee.emit('player_move', x, y);
        })
    }

    public addOnLeave(user: User, networkManager: NetworkManager) {
        networkManager.ee.once(`leave_${user.id}`, () => {
            this._networkPlayerMap.get(user.id)?.destroy();
            this._networkPlayerMap.delete(user.id);
        });
    }

    private _buildNetworkPlayer(user: User, pos: Vector2, networkManager: NetworkManager) {
        const instantlater = this.engine.instantlater;
        const posPrefabRef = new PrefabRef<Vector2>(pos);

        const prefab = 
            instantlater.buildPrefab(`${prefix}/player_${user.id}`, NetworkPlayerPrefab)
                .withUserId(user.id)
                .withNetworkManager(networkManager)
                .withGridPosition(posPrefabRef)

        const builder = prefab.make();
        const prefabRef = new PrefabRef<GameObject>();
        
        this.addOnLeave(user, networkManager);
        builder.getGameObject(prefabRef);
        this._networkPlayerMap.set(user.id, prefabRef.ref!);

        this.gameObject.addChildFromBuilder(builder);
    }
}
