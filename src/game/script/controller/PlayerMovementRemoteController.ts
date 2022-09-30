import { Component, GridPointer } from "the-world-engine";
import { Vector2 } from "three/src/Three";

import { PlayerNetworker } from "../networker/PlayerNetworker";
import { PlayerGridMovementController } from "./PlayerGridMovementController";

export class PlayerMovementRemoteController extends Component {
    public override readonly disallowMultipleComponent: boolean = true;
    public override readonly requiredComponents = [PlayerGridMovementController];

    private _playerGridMovementController: PlayerGridMovementController|null = null;
    private _networkManager: PlayerNetworker|null = null;
    private _userId: string|null = null;
    private _gridPointer: GridPointer|null = null;
    private _listenerAdded = false;

    private readonly _initFuncList: (() => void)[] = [];

    public awake(): void {
        this._playerGridMovementController = this.gameObject.getComponent(PlayerGridMovementController);

        const initFuncList = this._initFuncList;
        for (let i = 0; i < initFuncList.length; i++) {
            initFuncList[i]();
        }
        this._initFuncList.length = 0;
    }

    public setNetworkManager(networkManager: PlayerNetworker, userId: string): void {
        this._networkManager = networkManager;
        this._userId = userId;

        this._networkManager.ee.on(`move_requested_${this._userId}`, this.onMove);
        this._networkManager.ee.on(`teleport_${this._userId}`, this.onTeleport);
    }

    public onDestroy(): void {
        if (this._networkManager === null) return;
        if (this._userId === null) return;

        this._networkManager.ee.removeListener(`move_requested_${this._userId}`, this.onMove);
        this._networkManager.ee.removeListener(`teleport_${this._userId}`, this.onTeleport);
    }

    private readonly onTeleport = (gridPosition: Vector2): void => {
        if (!this.initialized) {
            this._initFuncList.push(() => this.onTeleport(gridPosition));
            return;
        }

        this._playerGridMovementController?.teleport(gridPosition);
    };

    private readonly onMove = (destination: Vector2): void => {
        if (!this.initialized) {
            this._initFuncList.push(() => this.onMove(destination));
            return;
        }

        const movementController = this._playerGridMovementController;
        if (!movementController) return;

        movementController.cancelPathfind();
        const pathfindResult = movementController.tryStartPathfind(destination);
        if (!pathfindResult) return;

        if (!this._listenerAdded) {
            movementController.onMovedToTarget.addListener(this.onMovedToTarget);
            this._listenerAdded = true;
            movementController.receiveKeyboardInput = false;
            this._gridPointer = movementController.gridPointer;
            movementController.gridPointer = null;
        }
    };

    private readonly onMovedToTarget = (): void => {
        const movementController = this._playerGridMovementController;
        if (!movementController) return;

        if (this._listenerAdded) {
            movementController.onMovedToTarget.removeListener(this.onMovedToTarget);
            this._listenerAdded = false;
            movementController.receiveKeyboardInput = true;
            movementController.gridPointer = this._gridPointer;
            this._gridPointer = null;
        }
    };
}
