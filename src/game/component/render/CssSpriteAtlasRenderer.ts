import { CSS3DSprite } from "three/examples/jsm/renderers/CSS3DRenderer";
import { Component } from "../../engine/hierarchyObject/Component";

export class CssSpriteAtlasRenderer extends Component {
    protected readonly _disallowMultipleComponent: boolean = true;

    private _sprite: CSS3DSprite|null = null;
    private _HTMLImageElement: HTMLImageElement|null = null;
    private _rowCount: number = 1;
    private _columnCount: number = 1;
    private _croppedImageWidth: number = 0;
    private _croppedImageHeight: number = 0;
    private _currentImageIndex: number = 0;
    private static readonly _defaultImagePath: string = `${process.env.PUBLIC_URL}/assets/tilemap/default.png`;

    protected start(): void {
        if (!this._HTMLImageElement) {
            this.setImage(CssSpriteAtlasRenderer._defaultImagePath, 1, 1);
        }
    }

    public onDestroy(): void {
        if (this._sprite) this._gameObject.remove(this._sprite);
    }

    public get imagePath(): string|null {
        return this._HTMLImageElement?.src || null;
    }

    public setImage(path: string, rowCount: number, columnCount: number): void {
        this._rowCount = rowCount;
        this._columnCount = columnCount;

        if (!this._HTMLImageElement) {
            this._HTMLImageElement = document.createElement("img");
            this._HTMLImageElement.style.imageRendering = "pixelated";
        }

        this._HTMLImageElement.src = path;

        this._HTMLImageElement.addEventListener("load", e => {
            const image = e.target as HTMLImageElement;
            this._croppedImageWidth = image.naturalWidth / this._columnCount;
            this._croppedImageHeight = image.naturalHeight / this._rowCount;
            image.style.width = `${this._croppedImageWidth}px`;
            image.style.height = `${this._croppedImageHeight}px`;
            image.style.objectFit = "none";
            if (!this._sprite) {
                this._sprite = new CSS3DSprite(this._HTMLImageElement as HTMLImageElement);
                this._gameObject.add(this._sprite);
            }
            this.updateImageByIndex();
        });
    }

    private updateImageByIndex(): void {
        if (this._sprite) {
            const width = -(this._currentImageIndex % this._columnCount * this._croppedImageWidth);
            const height = -Math.floor(this._currentImageIndex / this._columnCount) * this._croppedImageHeight;
            console.log(width, height);
            this._sprite.element.style.objectPosition = `${width}px ${height}px`;
        }
    }

    public set imageIndex(value: number) {
        this._currentImageIndex = value;
        this.updateImageByIndex();
    }

    public get rowCount(): number {
        return this._rowCount;
    }

    public get columnCount(): number {
        return this._columnCount;
    }
}
