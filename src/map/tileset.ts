import {TextureLoader} from './textureloader';

export class Tileset {
  public readonly image: HTMLImageElement;

  constructor(filename: string, loader: TextureLoader) {
    this.image = loader.load(filename);
  }
}
