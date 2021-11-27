import { CSS3DSprite } from "three/examples/jsm/renderers/CSS3DRenderer";
import { Component } from "../../engine/hierarchyObject/Component";

export class CssSpriteRenderer extends Component {
    protected readonly _disallowMultipleComponent: boolean = true;

    private _sprite: CSS3DSprite|null = null;
    private _HTMLImageElement: HTMLImageElement|null = null;
    private static readonly _defaultImagePath: string = `${process.env.PUBLIC_URL}/assets/default.png`;

    protected start(): void {
        if (!this._HTMLImageElement) {
            this.imagePath = CssSpriteRenderer._defaultImagePath;
        }
    }

    public onDestroy(): void {
        if (this._sprite) this._gameObject.remove(this._sprite);
    }

    public get imagePath(): string|null {
        return this._HTMLImageElement?.src || null;
    }

    public set imagePath(path: string|null) {
        if (!path) path = CssSpriteRenderer._defaultImagePath;

        if (!this._HTMLImageElement) {
            this._HTMLImageElement = document.createElement("img");
            this._HTMLImageElement.style.imageRendering = "pixelated";
        }

        this._HTMLImageElement.src = path;

        this._HTMLImageElement.addEventListener("load", () => {
            if (!this._sprite) {
                this._sprite = new CSS3DSprite(this._HTMLImageElement as HTMLImageElement);
                this._gameObject.add(this._sprite);
            }
        });
    }
}