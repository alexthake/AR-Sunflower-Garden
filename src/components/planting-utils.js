AFRAME.registerComponent("throw-seed", {
	schema: {
		buttonID: {
			type: "string",
			default: "",
		},
		modelID: {
			type: "string",
			default: "",
		},
		soilID: {
			type: "string",
			default: "",
		},
		power: {
			default: 10,
		},
		enabled: {
			default: true,
		}
	},
	init() {
		const button = document.querySelector(this.data.buttonID)
		const soil = document.querySelector(this.data.soilID)
		let planted = false
		button.addEventListener("click", () => {
			if(this.data.enabled) {
				let newSeed = document.createElement('a-entity')
				newSeed.setAttribute('gltf-model', this.data.modelID)
				newSeed.setAttribute('position', {x: this.el.object3D.position.x, y: this.el.object3D.position.y - 0.1, z: this.el.object3D.position.z})
				newSeed.setAttribute('rotation', {x:0, y:45, z:0})
				newSeed.setAttribute('scale', '2 2 2')
				newSeed.classList.add('seed')
				newSeed.setAttribute('ammo-body', {
					type: "dynamic",
					mass: "5",
				})
				newSeed.setAttribute('ammo-shape', {
					type: "box",
					fit: "manual",
					halfExtents: "0.02 0.035 0.02",
					offset: "0.01 0 0"
				})
				this.el.sceneEl.appendChild(newSeed)

				newSeed.addEventListener("body-loaded", () => {
					var velocity = new Ammo.btVector3()
					const projectileWorldDirection = new THREE.Vector3()
					this.el.object3D.getWorldDirection(projectileWorldDirection)
					velocity.setValue(projectileWorldDirection.x * - 1 * this.data.power, projectileWorldDirection.y * - 1 * this.data.power, projectileWorldDirection.z * - 1 * this.data.power)
					var axis = new THREE.Vector3( 1, 0, 0 );
					var angle = THREE.MathUtils.degToRad(45);
					projectileWorldDirection.applyAxisAngle( axis, angle );
					newSeed.components["ammo-body"].body.setLinearVelocity(velocity)
				})

				// setTimeout(() => {
				// 	newSeed?.parentNode.removeChild(newSeed)
				// }, 1500)
			}
		})
		soil.addEventListener("collidestart", (e) => {
			if(planted == false && e.detail.targetEl.classList.contains('seed')) {
				planted = true
				soil.setAttribute('planted', true)
				soil.querySelector('.shoot').emit('planted')
				soil.querySelector('.shoot').setAttribute('visible', 'true')
				document.getElementById('hint').innerHTML = 'You got it in, now it needs water.'
				setTimeout(() => {
						e.detail.targetEl.parentNode.removeChild(e.detail.targetEl)
				}, 50)
			}
		})
	},
});

AFRAME.registerComponent("watercan", {
	schema: {
		buttonID: {
			type: "string",
			default: "",
		},
		wateringCanID: {
			type: "string",
			default: "",
		},
		raycasterID: {
			type: "string",
			default: "",
		},
		enabled: {
			default: true,
		}
	},
	init() {
		const button = document.querySelector(this.data.buttonID)
		const raycaster = document.querySelector(this.data.raycasterID)
		const watercan = document.querySelector(this.data.wateringCanID)
		const scene = document.querySelector('a-scene')
		const pocket = document.getElementById('pocketright')
		button.addEventListener("click", () => {
			if(this.data.enabled && watercan.getAttribute('watering') == 'false') {
				let target = raycaster.components.raycaster.intersectedEls[0]
				if(target && target.getAttribute('planted') == 'true' && target.getAttribute('watered') != '2') {
					watercan.setAttribute('watering', true)
					scene.object3D.attach( watercan.object3D )
					let worldPosition = new THREE.Vector3()
					target.object3D.getWorldPosition(worldPosition)
					console.log(worldPosition)
					watercan.object3D.position.setX(worldPosition.x + 0.15)
					watercan.object3D.position.setZ(worldPosition.z + 0.15)
					watercan.object3D.position.setY(0.5)
					watercan.emit('water')
					setTimeout(() => {
						watercan.emit('stopwater')
					}, 1800)
					setTimeout(() => {
						target.setAttribute('watered', Number(target.getAttribute('watered')) + 1 )
						console.log(target.getAttribute('watered'))
						if(target.getAttribute('watered') == 1) {
							target.querySelector('.shoot').emit('water1')
							document.getElementById('hint').innerHTML = 'It just needs a bit more.'
						} else if(target.getAttribute('watered') == 2) {
							target.querySelector('.shoot').emit('water2')
							target.querySelector('.sunflower').emit('water2')
							target.querySelector('.sunflower').setAttribute('visible', 'true')
							document.getElementById('hint').innerHTML = 'Congrats! You grew a sunflower.'
						}
						watercan.setAttribute('watering', false)
						pocket.object3D.attach( watercan.object3D )
						watercan.object3D.position.setX(0)
						watercan.object3D.position.setZ(0)
						watercan.object3D.position.setY(0)
					}, 3000)
				}
			}
		})
	},
});