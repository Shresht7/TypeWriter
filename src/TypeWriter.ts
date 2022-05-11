interface TypeWriterOptions {
  loop?: boolean;
  writeSpeed?: number;
  eraseSpeed?: number;
}

type TypeWriterCallback = () => Promise<void>;

export default class TypeWriter {
  private queue: TypeWriterCallback[] = [];

  public element: HTMLElement;

  private loop: boolean = false;
  private writeSpeed: number = 50;
  private eraseSpeed: number = 100;

  constructor(
    element: HTMLElement,
    { loop = false, writeSpeed = 50, eraseSpeed = 100 }: TypeWriterOptions = {}
  ) {
    this.element = document.createElement("div");
    element.append(this.element);

    this.loop = loop;
    this.writeSpeed = writeSpeed;
    this.eraseSpeed = eraseSpeed;
  }

  write(str: string) {
    this.addToQueue(
      this.step((i: number) => this.element.append(str[i]), {
        speed: this.writeSpeed,
        limit: str.length
      })
    );
    return this;
  }

  erase(count: number) {
    this.addToQueue(
      this.step(
        (i: number) => {
          this.element.innerText = this.element.innerText.substring(
            0,
            this.element.innerText.length - 1
          );
        },
        { speed: this.eraseSpeed, limit: count + 1 }
      )
    );
    return this;
  }

  eraseAll(deleteSpeed = this.eraseSpeed) {
    this.addToQueue(
      this.step(
        (i: number) => {
          this.element.innerText = this.element.innerText.substring(
            0,
            this.element.innerText.length - 1
          );
        },
        { speed: this.eraseSpeed, limit: this.element.innerText.length }
      )
    );
    this.addToQueue((resolve) => {
      let i = 0;
      const interval = setInterval(() => {
        this.element.innerText = this.element.innerText.substring(
          0,
          this.element.innerText.length - 1
        );
        i++;
        if (i > this.element.innerText.length) {
          this.element.innerText = "";
          clearInterval(interval);
          resolve();
        }
      }, deleteSpeed);
    });
    return this;
  }

  pause(duration: number) {
    this.addToQueue((resolve) => {
      setTimeout(() => resolve(), duration);
    });
    return this;
  }

  async start() {
    let cb = this.queue.shift();
    while (cb) {
      await cb();
      if (this.loop) {
        this.queue.push(cb);
      }
      cb = this.queue.shift();
    }
    return this;
  }

  private addToQueue(cb: (resolve: () => void) => void) {
    this.queue.push(() => new Promise(cb));
  }

  private step(
    cb: Function,
    { speed = 50, limit = 999 }: { speed?: number; limit?: number } = {}
  ) {
    return function (resolve: () => void) {
      let i = 0;
      const interval = setInterval(() => {
        cb(i);
        i++;
        if (i >= limit) {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    };
  }
}
