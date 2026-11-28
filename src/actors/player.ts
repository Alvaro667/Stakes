import {
  Actor,
  Keys,
  PointerButton,
  PointerEvent,
  vec,
  Rectangle, 
  Side, 
  Color,
  Collider,
  CollisionContact, 
  //CollisionType,
  Engine, 
} from "excalibur";
//import { Resources } from "./resources";
import { PLAYER_CONFIG } from "./../config/PlayerConfig";
import { Weapon } from "./objects/Weapon";


// Actors are the main unit of composition you'll likely use, anything that you want to draw and move around the screen
// is likely built with an actor

// They contain a bunch of useful components that you might use
// actor.transform
// actor.motion
// actor.graphics
// actor.body
// actor.collider
// actor.actions
// actor.pointer


export class Player extends Actor {
  private isCharging = false;
  private weapon = new Weapon();
  constructor() {
    super({
      // Giving your actor a name is optional, but helps in debugging using the dev tools or debug mode
      // https://github.com/excaliburjs/excalibur-extension/
      // Chrome: https://chromewebstore.google.com/detail/excalibur-dev-tools/dinddaeielhddflijbbcmpefamfffekc
      // Firefox: https://addons.mozilla.org/en-US/firefox/addon/excalibur-dev-tools/
      name: 'Player',
      pos: vec(150, 150),
      width: PLAYER_CONFIG.width,
      height: PLAYER_CONFIG.height,
      // anchor: vec(0, 0), // Actors default center colliders and graphics with anchor (0.5, 0.5)
      // collisionType: CollisionType.Active, // Collision Type Active means this participates in collisions read more https://excaliburjs.com/docs/collisiontypes
    });

    this.graphics.add(
      new Rectangle({
        width: PLAYER_CONFIG.width,
        height: PLAYER_CONFIG.height,
        color: Color.White
      }),
      {
        offset: vec(0, 0)
      }
    );
  }

  override onInitialize(engine: Engine) {
    // Generally recommended to stick logic in the "On initialize"
    // This runs before the first update
    // Useful when
    // 1. You need things to be loaded like Images for graphics
    // 2. You need excalibur to be initialized & started 
    // 3. Deferring logic to run time instead of constructor time
    // 4. Lazy instantiation
    //this.graphics.add(Resources.Sword.toSprite());

    // Actions are useful for scripting common behavior, for example patrolling enemies
    /*this.actions.delay(2000);
    this.actions.repeatForever(ctx => {
      ctx.moveBy({offset: vec(100, 0), duration: 1000});
      ctx.moveBy({offset: vec(0, 100), duration: 1000});
      ctx.moveBy({offset: vec(-100, 0), duration: 1000});
      ctx.moveBy({offset: vec(0, -100), duration: 1000});
    });*/

    // Sometimes you want to click on an actor!
    this.on('pointerdown', evt => {
      // Pointer events tunnel in z order from the screen down, you can cancel them!
      // if (true) {
      //   evt.cancel();
      // }
      console.log('You clicked the actor @', evt.worldPos.toString());
    });

    this.setupMouse(engine);
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    // Put any update logic here runs every frame before Actor builtins
    let x = 0;
    let y = 0;

    if (engine.input.keyboard.isHeld(Keys.W)) y -= 1;
    if (engine.input.keyboard.isHeld(Keys.S)) y += 1;
    if (engine.input.keyboard.isHeld(Keys.D)) x += 1;
    if (engine.input.keyboard.isHeld(Keys.A)) x -= 1;

    const direction = vec(x, y);

    if (direction.magnitude > 0) {
      this.vel = direction.normalize().scale(PLAYER_CONFIG.speed); //melhorar movimento e adicionar corrida
    } else {
      this.vel = vec(0, 0);
    }

    this.handleMouseAim(engine);

    this.weapon.update(elapsedMs, this.isCharging);
  }

  override onPostUpdate(engine: Engine, elapsedMs: number): void {
    // Put any update logic here runs every frame after Actor builtins
  }

  override onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    // Called before a collision is resolved, if you want to opt out of this specific collision call contact.cancel()
  }

  override onPostCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    // Called every time a collision is resolved and overlap is solved
  }

  override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    // Called when a pair of objects are in contact
  }

  override onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    // Called when a pair of objects separates
  }

  private setupMouse(engine: Engine): void {
    const pointer = engine.input.pointers.primary;

    pointer.on("down", (pointerEvent: PointerEvent) => {
      if (pointerEvent.button === PointerButton.Left) {
        this.isCharging = true;
      }
    });

    pointer.on("up", (pointerEvent: PointerEvent) => {
      if (pointerEvent.button === PointerButton.Left) {
        if (this.isCharging) {
          this.isCharging = false;
          this.shoot(engine);
        }
      }
    });

    pointer.on("cancel", () => {
      this.isCharging = false;
    });
  }

  private handleMouseAim(engine: Engine): void {
    const mousePosition = engine.input.pointers.primary.lastWorldPos;

    if (!mousePosition) return;

    const direction = mousePosition.sub(this.pos);

    if (direction.magnitude === 0) return;

    this.rotation = direction.toAngle();
  }

  private shoot(engine: Engine): void {
    const mousePosition = engine.input.pointers.primary.lastWorldPos;

    if (!mousePosition) return;

    const direction = mousePosition.sub(this.pos);

    if (direction.magnitude === 0) return;

    this.weapon.shoot(engine, this.pos, direction.normalize());
  }
}
