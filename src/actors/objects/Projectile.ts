import {
  Actor,
  Vector,
  Color,
  CollisionType,
} from "excalibur";

export class Projectile extends Actor {
  private direction: Vector;
  private speed = 500;

  constructor(position: Vector, direction: Vector, onEnemyKilled: () => void) {
    super({
      name: "Projectile",
      pos: position,
      width: 8,
      height: 8,
      color: Color.Yellow,
      collisionType: CollisionType.Passive,
    });

    this.direction = direction.normalize();
  }

  override onPreUpdate(): void {
    this.vel = this.direction.scale(this.speed);
  }
}
