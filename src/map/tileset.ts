import {TextureLoader} from './textureloader';

export class Tileset {
  public readonly image: HTMLImageElement;
  public readonly name: string;

  constructor(filename: string, loader: TextureLoader, name: string) {
    this.image = loader.load(filename);
    this.name = name;
  }
}
