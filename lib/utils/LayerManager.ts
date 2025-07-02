 // LayerManager utility for global z-index/layer order management

export type LayerElement = { id: string };

export class LayerManager {
  private layerOrder: string[];

  constructor(initialOrder: string[] = []) {
    this.layerOrder = [...initialOrder];
  }

  getOrder() {
    return [...this.layerOrder];
  }

  setOrder(newOrder: string[]) {
    this.layerOrder = [...newOrder];
  }

  addElement(id: string) {
    if (!this.layerOrder.includes(id)) {
      this.layerOrder.push(id);
    }
  }

  removeElement(id: string) {
    this.layerOrder = this.layerOrder.filter((el) => el !== id);
  }

  bringToFront(id: string) {
    this.removeElement(id);
    this.layerOrder.push(id);
  }

  sendToBack(id: string) {
    this.removeElement(id);
    this.layerOrder.unshift(id);
  }

  bringForward(id: string) {
    const idx = this.layerOrder.indexOf(id);
    if (idx > -1 && idx < this.layerOrder.length - 1) {
      [this.layerOrder[idx], this.layerOrder[idx + 1]] = [this.layerOrder[idx + 1], this.layerOrder[idx]];
    }
  }

  sendBackward(id: string) {
    const idx = this.layerOrder.indexOf(id);
    if (idx > 0) {
      [this.layerOrder[idx], this.layerOrder[idx - 1]] = [this.layerOrder[idx - 1], this.layerOrder[idx]];
    }
  }

  has(id: string) {
    return this.layerOrder.includes(id);
  }
}

export default LayerManager;
