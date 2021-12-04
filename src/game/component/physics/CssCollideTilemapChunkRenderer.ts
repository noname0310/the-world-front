import { Vector2, Vector3 } from "three";
import { Component } from "../../engine/hierarchy_object/Component";
import { CssCollideTilemapRenderer } from "./CssCollideTilemapRenderer";
import { TileAtlasItem } from "../render/CssTilemapRenderer";
import { IGridCollideable } from "./IGridColideable";

export class CssCollideTilemapChunkRenderer extends Component implements IGridCollideable {
    private readonly _cssTilemapRendererMap: Map<`${number}_${number}`, CssCollideTilemapRenderer> = new Map();
    //key is chunk position in string format "x_y"
    private _chunkSize: number = 16;
    private _tileWidth: number = 16;
    private _tileHeight: number = 16;
    private _imageSources: TileAtlasItem[]|null = null;
    
    private _initializeFunctions: ((() => void))[] = [];

    protected start(): void {
        this._initializeFunctions.forEach(func => func());
        this._initializeFunctions = [];
    }

    private updateTilemapPosition() {
        this._cssTilemapRendererMap.forEach((renderer, key) => {
            const chunkIndexX = this.getIndexXFromKey(key) * this._chunkSize * this._tileWidth;
            const chunkIndexY = this.getIndexYFromKey(key) * this._chunkSize * this._tileHeight;
            renderer.gameObject.position.set(chunkIndexX, chunkIndexY, 0);
        });
    }

    private getIndexXFromKey(key: string): number {
        return parseInt(key.substring(0, key.indexOf("_")));
    }

    private getIndexYFromKey(key: string): number {
        return parseInt(key.substring(key.indexOf("_") + 1));
    }

    private getKeyFromIndex(x: number, y: number): `${number}_${number}` {
        return `${x}_${y}`;
    }

    private computeDrawPosition(chunkIndexX: number, chunkIndexY: number, x: number, y: number): Vector2 {
        //get relative position in chunk
        //note: 0,0 is center of chunk
        const relativeX = (x - chunkIndexX * this._chunkSize) + this._chunkSize / 2;
        const relativeY = (y - chunkIndexY * this._chunkSize) + this._chunkSize / 2;

        return new Vector2(relativeX, relativeY);
    }

    private getTilemapRenedererOrCreate(chunkIndexX: number, chunkIndexY: number): CssCollideTilemapRenderer {
        const chunkIndex = this.getKeyFromIndex(chunkIndexX, chunkIndexY);
        let cssTilemapRenderer = this._cssTilemapRendererMap.get(chunkIndex);
        if (cssTilemapRenderer === undefined) {
            this.gameObject.addChildFromBuilder(
                this.gameManager.instantlater.buildGameObject(
                    `css_tilemap_renderer_${chunkIndexX}_${chunkIndexY}`, 
                    new Vector3(chunkIndexX * this._chunkSize * this._tileWidth, chunkIndexY * this._chunkSize * this._tileHeight, 0))
                    .withComponent(CssCollideTilemapRenderer, c => {
                        cssTilemapRenderer = c;
                        if (this._imageSources) c.imageSources = this._imageSources;
                        c.gridCellWidth = this._tileWidth;
                        c.gridCellHeight = this._tileHeight;
                        c.rowCount = this._chunkSize;
                        c.columnCount = this._chunkSize;
                    })
            );
            this._cssTilemapRendererMap.set(chunkIndex, cssTilemapRenderer!);
        }
        return cssTilemapRenderer!;
    }

    public drawTile(x: number, y: number, imageIndex: number, atlasIndex?: number): void {
        if (!this.started && !this.starting) {
            this._initializeFunctions.push(() => {
                this.drawTile(x, y, imageIndex, atlasIndex);
            });
            return;
        }
        const chunkIndexX = Math.floor((x + this._chunkSize / 2) / this._chunkSize);
        const chunkIndexY = Math.floor((y + this._chunkSize / 2) / this._chunkSize);
        const cssTilemapRenderer = this.getTilemapRenedererOrCreate(chunkIndexX, chunkIndexY);
        const drawPosition = this.computeDrawPosition(chunkIndexX, chunkIndexY, x, y);
        const drawOffsetX = this.chunkSize % 2 === 0 ? 0 : -0.5;
        const drawOffsetY = this.chunkSize % 2 === 0 ? 0 : 0.5;
        cssTilemapRenderer!.drawTile(drawPosition.x + drawOffsetX, this._chunkSize - drawPosition.y - 1 + drawOffsetY, imageIndex, atlasIndex);
    }

    public addCollider(x: number, y: number): void {
        if (!this.started && !this.starting) {
            this._initializeFunctions.push(() => {
                this.addCollider(x, y);
            });
            return;
        }
        const chunkIndexX = Math.floor((x + this._chunkSize / 2) / this._chunkSize);
        const chunkIndexY = Math.floor((y + this._chunkSize / 2) / this._chunkSize);
        const cssTilemapRenderer = this.getTilemapRenedererOrCreate(chunkIndexX, chunkIndexY);
        const drawPosition = this.computeDrawPosition(chunkIndexX, chunkIndexY, x, y);
        const drawOffsetX = this.chunkSize % 2 === 0 ? 0 : -0.5;
        const drawOffsetY = this.chunkSize % 2 === 0 ? 0 : 0.5;
        cssTilemapRenderer!.addCollider(drawPosition.x + drawOffsetX, this._chunkSize - drawPosition.y - 1 + drawOffsetY);
    }

    public drawTileFromTwoDimensionalArray(array: ({i: number, a: number}|null)[][], xOffset: number, yOffset: number): void {
        if (!this.started && !this.starting) {
            this._initializeFunctions.push(() => {
                this.drawTileFromTwoDimensionalArray(array, xOffset, yOffset);
            });
            return;
        }
        
        for (let y = 0; y < array.length; y++) {
            for (let x = 0; x < array[y].length; x++) {
                if (array[y][x] === null) continue;
                this.drawTile(x + xOffset, array.length - y + yOffset, array[y][x]!.i, array[y][x]!.a);
            }
        }
    }

    public checkCollision(x: number, y: number, width: number, height: number): boolean {
        const chunkIndexX = Math.floor((x / this._tileWidth + this._chunkSize / 2) / this._chunkSize);
        const chunkIndexY = Math.floor((y / this._tileHeight + this._chunkSize / 2) / this._chunkSize);
        const chunkIndex = this.getKeyFromIndex(chunkIndexX, chunkIndexY);
        let cssTilemapRenderer = this._cssTilemapRendererMap.get(chunkIndex);
        if (cssTilemapRenderer === undefined) {
            return false;
        }
        return cssTilemapRenderer!.checkCollision(x, y, width, height);
    }

    public get chunkSize(): number {
        return this._chunkSize;
    }

    public set chunkSize(value: number) {
        this._chunkSize = value;
        this.updateTilemapPosition();
        this._cssTilemapRendererMap.forEach((renderer, _) => {
            renderer.rowCount = this._chunkSize;
            renderer.columnCount = this._chunkSize;
        });
    }

    public set imageSources(value: TileAtlasItem[]) {
        if (!this.started && !this.starting) {
            this._initializeFunctions.push(() => {
                this.imageSources = value;
            });
            return;
        }

        this._imageSources = value;
    }

    public get gridCellWidth(): number {
        return this._tileWidth;
    }

    public set gridCellWidth(value: number) {
        if (this._tileWidth === value) return;
        this._tileWidth = value;
        this.updateTilemapPosition();
        this._cssTilemapRendererMap.forEach((renderer, _) => {
            renderer.gridCellWidth = this._tileWidth;
        });
    }

    public get gridCellHeight(): number {
        return this._tileHeight;
    }

    public set gridCellHeight(value: number) {
        if (this._tileHeight === value) return;
        this._tileHeight = value;
        this.updateTilemapPosition();
        this._cssTilemapRendererMap.forEach((renderer, _) => {
            renderer.gridCellHeight = this._tileHeight;
        });
    }

    public get gridCenter(): Vector2 {
        const offsetX = this._chunkSize % 2 === 1 ? 0 : this._tileWidth / 2;
        const offsetY = this._chunkSize % 2 === 1 ? 0 : this._tileHeight / 2;
        return new Vector2(this.gameObject.position.x + offsetX, this.gameObject.position.y + offsetY);
    }

    public get gridCenterX(): number {
        const offsetX = this._chunkSize % 2 === 1 ? 0 : this._tileWidth / 2;
        return this.gameObject.position.x + offsetX;
    }

    public get gridCenterY(): number {
        const offsetY = this._chunkSize % 2 === 1 ? 0 : this._tileHeight / 2;
        return this.gameObject.position.y + offsetY;
    }
}
