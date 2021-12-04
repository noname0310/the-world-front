import { Euler, MathUtils, Quaternion, Vector2, Vector3 } from "three";
import { CameraController } from "./component/controller/CameraController";
import { CssCollideTilemapChunkRenderer } from "./component/physics/CssCollideTilemapChunkRenderer";
import { IframeRenderer } from "./component/render/IframeRenderer";
import { ZaxisSorter } from "./component/render/ZaxisSorter";
import { IBootstrapper } from "./engine/bootstrap/IBootstrapper";
import { SceneBuilder } from "./engine/bootstrap/SceneBuilder";
import { GameManager } from "./engine/GameManager";
import { GameObject } from "./engine/hierarchy_object/GameObject";
import { Scene } from "./engine/hierarchy_object/Scene";
import { InstancedObjectsPrefab } from "./prefab/InstancedObjectsPrefab";
import { NetworkPlayerPrefab } from "./prefab/NetworkPlayerPrefab";
import { PlayerPrefab } from "./prefab/PlayerPrefab";
import { TilemapChunkPrefab } from "./prefab/TilemapChunkPrefab";

export class TheWorldBootstrapper implements IBootstrapper {
    public run(scene: Scene, gameManager: GameManager): SceneBuilder {
        const instantlater = gameManager.instantlater;

        let player: {ref: GameObject|null} = {ref: null};
        let colideTilemap: {ref: CssCollideTilemapChunkRenderer|null} = {ref: null};

        return new SceneBuilder(scene)
            .withChild(instantlater.buildPrefab("tilemap", TilemapChunkPrefab, new Vector3(0, 0, -100))
                .getColideTilemapChunkRendererRef(colideTilemap).make())

            .withChild(instantlater.buildPrefab("objects", InstancedObjectsPrefab).make())

            .withChild(instantlater.buildPrefab("player", PlayerPrefab)
                .withNameTag("Steve Jobs")
                .withCollideMap(colideTilemap.ref!).make()
                .getGameObject(player))
            
            .withChild(instantlater.buildPrefab("network_player", NetworkPlayerPrefab)
                .withNameTag("Heewon")
                .with4x4SpriteAtlasFromPath("/assets/charactor/Heewon.png")
                .withGridInfo(colideTilemap.ref!)
                .withGridPosition(-1, -1)
                .make())

            .withChild(instantlater.buildGameObject("iframe", new Vector3(7 * 16 + 1, 5 * 16 + 7, 0),
                new Quaternion().setFromEuler(new Euler(MathUtils.degToRad(-15), MathUtils.degToRad(45), 0)))
                .withComponent(IframeRenderer, c => {
                    c.iframeSource = "https://www.youtube.com/embed/_6u84iKQxUU";
                    c.width = 36;
                    c.height = 18;
                    c.viewScale = 0.1;
                    c.iframeCenterOffset = new Vector2(0, 0.5);
                })
                .withComponent(ZaxisSorter))
            
            .withChild(instantlater.buildGameObject("camera_controller")
                .withComponent(CameraController, c => {
                    c.setTrackTarget(player.ref!);
                }));
    }
}
