namespace demosEgret {
    /**
     * How to use
     * 1. Load data.
     * 2. factory.parseDragonBonesData();
     *    factory.parseTextureAtlasData();
     * 3. armatureDisplay = factory.buildArmatureDisplay("armatureName");
     * 4. addChild(armatureDisplay);
     */
    export class HelloDragonBones extends BaseTest {
        public constructor() {
            super();

            this._resourceConfigURL = "resource/HelloDragonBones.json";
        }

        private _isMoved: boolean = false;
        private _isHorizontalMoved: boolean = false;
        private _armatureIndex: number = 0;
        private _animationIndex: number = 0;
        private _prevArmatureScale: number = 1;
        private _prevAnimationScale: number = 1;
        private _startPoint: egret.Point = new egret.Point();

        private _dragonBonesData: dragonBones.DragonBonesData = null;
        private _armatureDisplay: dragonBones.EgretArmatureDisplay = null;
        private _factory: dragonBones.EgretFactory = new dragonBones.EgretFactory();
        /** 
         * Init.
         */
        protected createGameScene(): void {
            // Parse data.
            this._dragonBonesData = this._factory.parseDragonBonesData(RES.getRes("dragonBonesData"));
            this._factory.parseTextureAtlasData(RES.getRes("textureDataA"), RES.getRes("textureA"));

            if (this._dragonBonesData) {
                // Add event listeners.
                this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this._touchHandler, this);
                this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this._touchHandler, this);
                this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this._touchHandler, this);

                // Add Armature.            
                this._changeArmature();
                this._changeAnimation();

                // Add infomation.            
                const text = new egret.TextField();
                text.x = 0;
                text.y = this.stage.stageHeight - 60;
                text.width = this.stage.stageWidth;
                text.textAlign = egret.HorizontalAlign.CENTER;
                text.size = 20;
                text.text = "Touch screen left to change Armature / right to change Animation.\nTouch move to scale Armatrue and Animation.";
                this.addChild(text);
            } else {
                throw new Error();
            }
        }
        /** 
         * Touch event listeners.
         * Touch to change Armature and Animation.
         * Touch move to change Armature and Animation scale.
         */
        private _touchHandler(event: egret.TouchEvent): void {
            switch (event.type) {
                case egret.TouchEvent.TOUCH_BEGIN:
                    this._prevArmatureScale = this._armatureDisplay.scaleX;
                    this._prevAnimationScale = this._armatureDisplay.animation.timeScale;
                    this._startPoint.setTo(event.stageX, event.stageY);
                    break;

                case egret.TouchEvent.TOUCH_END:
                    if (this._isMoved) {
                        this._isMoved = false;
                    } else {
                        const touchRight = event.stageX > this.stage.stageWidth * 0.5;
                        if (this._dragonBonesData.armatureNames.length > 1 && !touchRight) {
                            this._changeArmature();
                        }

                        this._changeAnimation();
                    }
                    break;

                case egret.TouchEvent.TOUCH_MOVE:
                    if (event.touchDown) {
                        const dX = this._startPoint.x - event.stageX;
                        const dY = this._startPoint.y - event.stageY;

                        if (!this._isMoved) {
                            const dAX = Math.abs(dX);
                            const dAY = Math.abs(dY);

                            if (dAX > 5 || dAY > 5) {
                                this._isMoved = true;
                                this._isHorizontalMoved = dAX > dAY;
                            }
                        }

                        if (this._isMoved) {
                            if (this._isHorizontalMoved) {
                                const currentAnimationScale = Math.max(-dX / 200 + this._prevAnimationScale, 0.01);
                                this._armatureDisplay.animation.timeScale = currentAnimationScale;
                            } else {
                                const currentArmatureScale = Math.max(dY / 200 + this._prevArmatureScale, 0.01);
                                this._armatureDisplay.scaleX = this._armatureDisplay.scaleY = currentArmatureScale;
                            }
                        }
                    }
                    break;
            }
        }
        /** 
         * Change Armature.
         */
        private _changeArmature(): void {
            const armatureNames = this._dragonBonesData.armatureNames;
            if (armatureNames.length == 0) {
                return;
            }

            // Remove prev Armature.
            if (this._armatureDisplay) {
                this._armatureDisplay.dispose();
                this.removeChild(this._armatureDisplay);
            }

            // Get next Armature name.
            this._animationIndex = 0;
            this._armatureIndex++;
            if (this._armatureIndex >= armatureNames.length) {
                this._armatureIndex = 0;
            }

            const armatureName = armatureNames[this._armatureIndex];

            // Build Armature display. (Factory.buildArmatureDisplay() will update Armature animation by Armature display)
            this._armatureDisplay = this._factory.buildArmatureDisplay(armatureName);
            //this._armatureDisplay.armature.cacheFrameRate = 24;

            // Add FrameEvent listener.
            this._armatureDisplay.addEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);

            // Add Armature display.
            this._armatureDisplay.x = this.stage.stageWidth * 0.5;
            this._armatureDisplay.y = this.stage.stageHeight * 0.5 + 100;
            this.addChild(this._armatureDisplay);
        }
        /** 
         * Change Armature animation.
         */
        private _changeAnimation(): void {
            if (!this._armatureDisplay) {
                return;
            }

            const animationNames = this._armatureDisplay.animation.animationNames;
            if (animationNames.length == 0) {
                return;
            }

            // Get next animation name.
            this._animationIndex++;
            if (this._animationIndex >= animationNames.length) {
                this._animationIndex = 0;
            }

            const animationName = animationNames[this._animationIndex];

            // Play animation.
            this._armatureDisplay.animation.play(animationName);
        }
        /** 
         * FrameEvent listener. (If animation has FrameEvent)
         */
        private _frameEventHandler(event: dragonBones.EgretEvent): void {
            console.log(event.eventObject.animationState.name, event.eventObject.name);
        }
    }
}