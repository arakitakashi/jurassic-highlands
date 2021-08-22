import autoBind from 'auto-bind'
import * as dat from 'dat.gui'

import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders'
import * as CANNON from 'cannon'
window.CANNON = CANNON

export default class Game {
  constructor () {
    this.canvas = document.getElementById('gameCanvas')
    this.engine = new BABYLON.Engine(this.canvas, true)
    this.resize()
    autoBind(this)

    document.addEventListener('DOMContentLoaded', this.startGame.bind(this))

    /**
     * Debug
     */
    // this.gui = new dat.GUI()
    // this.gui.add(this.freeCamera, 'y').min(-180).max(180).step(1)
  }

  createScene () {
    this.scene = new BABYLON.Scene(this.engine)
    // Physics
    this.scene.enablePhysics()

    // Environment
    const environment = this.scene.createDefaultEnvironment({
      createSkybox: true,
      skyboxSize: 150,
      skyboxColor: new BABYLON.Color3(0.1, 0.85, 0.95),
      enableGroundShadow: true
    })

    // AssetsManager
    this.scene.assetsManager = this.configureAssetsManager(this.scene)
    this.loadTextures()
    // this.loadMeshes()
    // this.scene.clearColor = new BABYLON.Color3(1, 0, 1)

    // CreateComponents
    this.createGround()
    this.createRuin()
    this.createPlane()

    this.createDinosaurs()

    this.createFreeCamera()
    this.createLights()
    this.createEventListeners()

    // const sphere = BABYLON.MeshBuilder.CreateSphere('sphere',
    //   { segments: 16, diameter: 2 }, this.scene)
    // sphere.position.y = 1

    // BABYLON.MeshBuilder.CreateGround('ground',
    //   { width: 6, height: 6, subdivisions: 2 }, this.scene)
  }

  startGame () {
    this.createScene()
    this.scene.toRender = () => {
      // if (this.plane) {
      //   this.plane.fireCannonBalls()
      // }
      this.scene.render()
    }
    this.scene.assetsManager.load()
  }

  resize () {
    window.addEventListener('resize', () => {
      this.engine.resize()
    })
  }

  // loadMeshes () {
  //   const assetsManager = this.scene.assetsManager
  //   let meshTask = assetsManager.addMeshTask('planeMesh', 'models/plane_baked.glb')
  //   meshTask.onSuccess = (task) => {
  //     console.log(task)
  //     this.scene.assets['planeMesh'] = task.mesh
  //   }
  //   meshTask.onError = (task) => {
  //     console.log(task)
  //   }

  //   meshTask = assetsManager.addMeshTask('ruinMesh', 'models/ruin_baked.glb')
  //   meshTask.onSuccess = (task) => {
  //     this.scene.assets['ruinMesh'] = task.mesh
  //   }
  // }

  loadTextures () {
    const assetsManager = this.scene.assetsManager
    let textureTask = assetsManager.addTextureTask('planeTexture', 'models/plane_baked.jpg')
    textureTask.onSuccess = (task) => {
      this.scene.assets['planeTexture'] = task.texture
    }

    textureTask = assetsManager.addTextureTask('highLandTexture', 'models/highLand_baked.jpg')
    textureTask.onSuccess = (task) => {
      this.scene.assets['highLandTexture'] = task.texture
    }

    textureTask = assetsManager.addTextureTask('ruinTexture', 'models/image.webp')
    textureTask.onSuccess = (task) => {
      this.scene.assets['ruinTexture'] = task.texture
    }

    textureTask = assetsManager.addTextureTask('triceratopsTexture', 'models/triceratops_baked.jpg')
    textureTask.onSuccess = (task) => {
      this.scene.assets['triceratopsTexture'] = task.texture
    }

    textureTask = assetsManager.addTextureTask('trexTexture', 'models/trex_baked.jpg')
    textureTask.onSuccess = (task) => {
      this.scene.assets['trexTexture'] = task.texture
    }
  }

  configureAssetsManager () {
    this.scene.assets = {}
    const assetsManager = new BABYLON.AssetsManager(this.scene)
    assetsManager.onProgress = (remainingCount, totalCount, lastFinishedTask) => {
      this.engine.loadingUIText = 'We are loading the scene.' + remainingCount + 'out of ' + totalCount + ' items still need to be loaded.'
    }

    assetsManager.onFinish = (tasks) => {
      this.engine.runRenderLoop(() => {
        this.scene.toRender()
      })
    }
    return assetsManager
  }

  createFreeCamera () {
    this.freeCamera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(-12, 16, 8), this.scene)
    // this.freeCamera.setTarget(BABYLON.Vector3.Zero())
    this.freeCamera.setTarget(new BABYLON.Vector3(-2, 9, 0))
    this.freeCamera.attachControl(this.canvas, false)
  }

  createLights () {
    this.light = new BABYLON.DirectionalLight('DirectionalLight', new BABYLON.Vector3(0, -2, 0), this.scene)
    this.light.position = (3, 15, -7)
    this.light.intensity = 1.1

    // this.light2 = new BABYLON.HemisphericLight('HemiLight', new BABYLON.Vector3(0, 5, 0), this.scene)
    // this.light2.intensity = 1
  }

  createGround () {
    this.ground = new BABYLON.MeshBuilder.CreateGround('ground', { height: 300, width: 300 })
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene)
    // console.log(this.scene.assets)
    // if (this.scene.assets) {
    //   console.log(this.scene.assets.highLandTexture)
    //   console.log(this.scene.assets['highLandTexture'])
    // }
    // // test
    // const groundTexture = this.scene.assets['highLandTexture']
    // console.log(groundTexture)
    // groundMaterial.diffuseTexture = groundTexture
    // groundMaterial.emissiveTexture = groundTexture
    // groundMaterial.ambientTexture = groundTexture

    groundMaterial.diffuseColor = new BABYLON.Color3(0.521, 0.827, 0.949)
    this.ground.material = groundMaterial

    const meshTask = this.scene.assetsManager.addMeshTask('HighLandTask', 'high_land', 'models/', 'high-land_baked.glb')
    meshTask.onSuccess = (task) => {
      const onHighLandImported = (newMeshes, particleSystems, skeletons) => {
        newMeshes[0].position = new BABYLON.Vector3(0, 0, 0)
        newMeshes[0].name = 'highLand'

        const highLandTexture = this.scene.assets['highLandTexture']
        console.log(highLandTexture)
        const highLandMaterial = new BABYLON.StandardMaterial('highLandMaterial', this.scene)
        highLandMaterial.diffuseTexture = highLandTexture
        highLandMaterial.emissiveTexture = highLandTexture
        highLandMaterial.ambientTexture = highLandTexture
        newMeshes[0].material = highLandMaterial

        this.highLand = newMeshes[0]
        this.highLand.scaling = new BABYLON.Vector3(1, 1, -1)
      }
      onHighLandImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons)
    }
    meshTask.onError = function (task, message, exception) {
      console.log(message, exception)
    }
  }

  createRuin () {
    const meshTask = this.scene.assetsManager.addMeshTask('RuinTask', 'ruin', 'models/', 'ruin_baked2.glb')
    meshTask.onSuccess = (task) => {
      const onRuinImported = (newMeshes, particleSystems, skeletons) => {
        newMeshes[0].position = new BABYLON.Vector3(0, 0.5, 0)
        newMeshes[0].name = 'ruin'
        const ruinTexture = this.scene.assets['ruinTexture']
        const ruinMaterial = new BABYLON.StandardMaterial('ruinMaterial', this.scene)
        ruinMaterial.diffuseTexture = ruinTexture

        if (newMeshes[0].material) {
          newMeshes[0].material = ruinMaterial
          newMeshes[0]._children.material = ruinMaterial
          newMeshes[0]._children._material = ruinMaterial
        }
        this.ruin = newMeshes[0]
        this.ruin.scaling = new BABYLON.Vector3(1, 1, -1)
      }
      onRuinImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons)
    }
    meshTask.onError = function (task, message, exception) {
      console.log(message, exception)
    }
    console.log(this.scene.assets)

    // this.scene.assets['ruinMesh'][0].position = new BABYLON.Vector3(0, 0.5, 0)
    // this.scene.assets['ruinMesh'][0].name = 'ruin'

    // this.ruin = this.scene.assets['ruinMesh'][0]
    // this.ruin.scaling = new BABYLON.Vector3(1, 1, -1)
  }

  createPlane () {
    const meshTask = this.scene.assetsManager.addMeshTask('PlaneTask', 'plane.001', 'models/', 'plane_baked2.glb')
    meshTask.onSuccess = (task) => {
      console.log(task)
      const onPlaneImported = (newMeshes, particleSystems, skeletons) => {
        console.log(newMeshes[0])
        newMeshes[0].position = new BABYLON.Vector3(-3, 10, 7)
        newMeshes[0].rotation = new BABYLON.Vector3(0, Math.PI / 5 * 4, 0)
        newMeshes[0].name = 'plane'
        const planeTexture = this.scene.assets['planeTexture']
        const planeMaterial = new BABYLON.PBRMaterial('planeMaterial', this.scene)
        planeMaterial.diffuseTexture = planeTexture
        console.log(newMeshes[0])
        console.log(newMeshes[0].material)
        console.log(newMeshes[0]._material)
        console.log(newMeshes[0]._children)

        if (!newMeshes[0].material) {
          newMeshes[0].material = planeMaterial
          newMeshes[0]._children.material = planeMaterial
        }

        console.log(newMeshes[0].material)
        console.log(newMeshes[0]._material)
        this.plane = newMeshes[0]
        this.plane.scaling = new BABYLON.Vector3(1, 1, -1)

        this.plane.canFireCannonBalls = true

        const spinAnim1 = this.scene.getAnimationGroupByName('fin.001Action')
        spinAnim1.start(true, 1.0, spinAnim1.from, spinAnim1.to, false)
        const spinAnim2 = this.scene.getAnimationGroupByName('finAction')
        spinAnim2.start(true, 1.0, spinAnim2.from, spinAnim2.to, false)
      }
      onPlaneImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons)
    }
    meshTask.onError = function (task, message, exception) {
      console.log(message, exception)
    }

    // this.plane.fireCannonBalls = () => {
    //   if (!this.isBPressed) return
    //   if (!this.plane.canFireCannonBalls) return
    //   this.plane.canFireCannonBalls = false

    //   setTimeout(() => {
    //     this.plane.canFireCannonBalls = true
    //   }, 500)

    //   // this.scene.assets.cannonSound.play()

    //   const cannonBall = new BABYLON.Mesh.CreateSphere('cannonBall', 32, 2, this.scene)
    //   cannonBall.material = new BABYLON.StandardMaterial('Fire', this.scene)
    //   cannonBall.material.diffuseTexture = new BABYLON.Texture('images/plane_baked.jpg', this.scene)

    //   const pos = this.plane.position

    //   cannonBall.position = new BABYLON.Vector3(pos.x, pos.y + 1, pos.z)
    //   cannonBall.position.addInPlace(this.plane.frontVector.multiplyByFloats(5, 5, 5))

    //   cannonBall.physicsImpostor = new BABYLON.PhysicsImpostor(cannonBall,
    //     BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1 }, this.scene)
    //   const fVector = this.plane.frontVector
    //   const force = new BABYLON.Vector3(fVector.x * 100, (fVector.y + 0.1) * 100, fVector.z * 100)
    //   cannonBall.physicsImpostor.applyImpulse(force, cannonBall.getAbsolutePosition())

    //   cannonBall.actionManager = new BABYLON.ActionManager(this.scene)

    //   // this.scene.dudes.forEach((dude) => {
    //   //   cannonBall.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
    //   //     {
    //   //       trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
    //   //       parameter: dude.Dude.bounder
    //   //     },
    //   //     () => {
    //   //       if (dude.Dude.bounder._isDisposed) return
    //   //       dude.Dude.gotKilled(this.scene)
    //   //     }
    //   //   ))
    //   // })

    //   setTimeout(() => {
    //     cannonBall.dispose()
    //   }, 3000)
    // }
  }

  createDinosaurs () {
    // triceratops
    const meshTask = this.scene.assetsManager.addMeshTask('triceratopsTask', 'triceratops', 'models/', 'triceratops_baked.glb')
    meshTask.onSuccess = (task) => {
      const onTriceratopsImported = (newMeshes, particleSystems, skeletons) => {
        newMeshes[0].position = new BABYLON.Vector3(0, 8, -2)
        // newMeshes[0].rotation = new BABYLON.Vector3(0, Math.PI / 5 * 4, 0)
        newMeshes[0].name = 'triceratops'
        const triceratopsTexture = this.scene.assets['triceratopsTexture']
        const triceratopsMaterial = new BABYLON.StandardMaterial('triceratopsMaterial', this.scene)
        // triceratopsMaterial.diffuseTexture = triceratopsTexture
        triceratopsMaterial.diffuseColor = new BABYLON.Color3(0.521, 0.827, 0.949)

        newMeshes[0].material = triceratopsMaterial
        console.log(newMeshes[0])
        this.triceratops = newMeshes[0]
        this.triceratops.scaling = new BABYLON.Vector3(0.05, 0.05, -0.05)
      }
      onTriceratopsImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons)
    }
    meshTask.onError = function (task, message, exception) {
      console.log(message, exception)
    }

    // trex
    const meshTask1 = this.scene.assetsManager.addMeshTask('trexTask', 'trex_baked', 'models/', 'trex_baked.glb')
    meshTask1.onSuccess = (task) => {
      const onTrexImported = (newMeshes, particleSystems, skeletons) => {
        newMeshes[0].position = new BABYLON.Vector3(0, 10, 1)
        newMeshes[0].rotation = new BABYLON.Vector3(0, Math.PI / 5 * 4, 0)
        newMeshes[0].name = 'trex'
        const trexTexture = this.scene.assets['trexTexture']
        const trexMaterial = new BABYLON.StandardMaterial('trexMaterial', this.scene)
        // trexMaterial.diffuseTexture = trexTexture
        trexMaterial.diffuseColor = new BABYLON.Color3(0.521, 0.827, 0.949)

        newMeshes[0].material = trexMaterial
        console.log(newMeshes[0])
        this.trex = newMeshes[0]
        this.trex.scaling = new BABYLON.Vector3(0.2, 0.2, -0.2)

        const workAnim = this.scene.getAnimationGroupByName('trexAction')

        workAnim.start(true, 1.0, 0, 5.92, false)
      }
      onTrexImported(task.loadedMeshes, task.loadedParticleSystems, task.loadedSkeletons)
    }
    meshTask1.onError = function (task, message, exception) {
      console.log(message, exception)
    }
  }

  createEventListeners () {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'w' || event.key === 'W') {
        this.isWPressed = true
      }
      if (event.key === 's' || event.key === 'S') {
        this.isSPressed = true
      }
      if (event.key === 'a' || event.key === 'A') {
        this.isAPressed = true
      }
      if (event.key === 'd' || event.key === 'D') {
        this.isDPressed = true
      }
      if (event.key === 'b' || event.key === 'B') {
        this.isBPressed = true
      }
      if (event.key === 'r' || event.key === 'R') {
        this.isRPressed = true
      }
    })

    document.addEventListener('keyup', (event) => {
      if (event.key === 'w' || event.key === 'W') {
        this.isWPressed = false
      }
      if (event.key === 's' || event.key === 'S') {
        this.isSPressed = false
      }
      if (event.key === 'a' || event.key === 'A') {
        this.isAPressed = false
      }
      if (event.key === 'd' || event.key === 'D') {
        this.isDPressed = false
      }
      if (event.key === 'b' || event.key === 'B') {
        this.isBPressed = false
      }
      if (event.key === 'r' || event.key === 'R') {
        this.isRPressed = false
      }
    })
  }
}
