import { Quaternion, Vector2, Vector3 } from "three";
import { CameraController } from "./component/controller/CameraController";
import { CameraRelativeZaxisSorter } from "./component/render/CameraRelativeZaxisSorter";
import { IframeRenderer } from "./component/render/IframeRenderer";
import { ZaxisSorter } from "./component/render/ZaxisSorter";
import { IBootstrapper } from "./engine/bootstrap/IBootstrapper";
import { SceneBuilder } from "./engine/bootstrap/SceneBuilder";
import { GameManager } from "./engine/GameManager";
import { GameObject } from "./engine/hierarchyObject/GameObject";
import { Scene } from "./engine/hierarchyObject/Scene";
import { PlayerPrefab } from "./prefab/PlayerPrefab";
import { TestTilemapChunkPrefab } from "./prefab/TestTilemapChunkPrefab";
import { TestTilemapPrefab } from "./prefab/TestTilemapPrefab";

export class TheWorldBootstrapper implements IBootstrapper {
    public run(scene: Scene, gameManager: GameManager): SceneBuilder {
        const instantlater = gameManager.instantlater;

        let player: {ref: GameObject|null} = {ref: null};

        return new SceneBuilder(scene)
            .withChild(instantlater.buildGameObject("iframe", new Vector3(64, 4, 0), new Quaternion(), new Vector3(0.3, 0.3, 1))
                .withComponent(ZaxisSorter)
                .withComponent(IframeRenderer, c => {
                    c.iframeSource = "https://www.youtube.com/embed/8nevghw8xbM";
                    c.width = 640 / 2;
                    c.height = 360 / 2;
                    c.iframeCenterOffset = new Vector2(0, 0.5);
                }))
            
            .withChild(instantlater.buildPrefab("tilemap_chunk", TestTilemapChunkPrefab, new Vector3(0, 0, -200)).make()
                .withComponent(CameraRelativeZaxisSorter, c => c.offset -= 100))
            
            .withChild(instantlater.buildPrefab("tilemap", TestTilemapPrefab, new Vector3(0, 0, -100)).make()
                .withComponent(CameraRelativeZaxisSorter))

            .withChild(instantlater.buildPrefab("player", PlayerPrefab, new Vector3(0, -32, 0))
                .with4x4SpriteAtlasFromPath(`${process.env.PUBLIC_URL}/assets/charactor/Seongwon.png`).make()
                .getGameObject(player))
            
            .withChild(instantlater.buildGameObject("camera_controller")
                .withComponent(CameraController, c => {
                    c.setTrackTarget(player.ref!);
                    c.pixelPerfect = true;
                }))
    }
}
