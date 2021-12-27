// import { Vector2 } from "three";
import { Server } from "../connect/types";
// import { GameObject } from "../engine/hierarchy_object/GameObject";

export interface IWorldEditorAction {
    setToolType(tools: Tool): void;
}


export class WorldEditorConnector {
    private _action: IWorldEditorAction | null = null;

    setToolType(...args: Parameters<IWorldEditorAction["setToolType"]>): void {
        return this._action?.setToolType(...args);
    }

    set action(action: IWorldEditorAction) {
        this._action = action;
    }
}


export abstract class Tool {
}

export namespace Tools {
    export class None extends Tool {
    }

    export class EraseTile extends Tool {
    }

    export class EraseObject extends Tool {
    }

    export class EraseCollider extends Tool {
    }
    
    export class ImageGameObject extends Tool {
        constructor(
            private readonly _imageInfo: Server.ImageGameObjectProto
        ) {
            super();
        }
    
        public get imageInfo(): Server.ImageGameObjectProto {
            return this._imageInfo;
        }
    }
    
    export class IframeGameObject extends Tool {
        constructor(
            private readonly _iframeInfo: Server.IframeGameObjectProto
        ) {
            super();
        }
    
        public get iframeInfo(): Server.IframeGameObjectProto {
            return this._iframeInfo;
        }
    }
    
    export class Collider extends Tool {
    }
    
    type tileType = {
        atlasIndex: number;
        atlas: Server.Atlas;
        type: Server.TileType;
    }
    export class Tile extends Tool {
        constructor (
            private readonly _tileInfo: tileType
        ) {
            super();
        }
    
        public get tileInfo(): tileType {
            return this._tileInfo;
        }
    }
}