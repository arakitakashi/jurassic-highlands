import autoBind from 'auto-bind'

import * as BABYLON from 'babylonjs'
import * as CANNON from 'cannon'
window.CANNON = CANNON

export default class Game {
  constructor () {
    this.canvas = document.getElementById('gameCanvas')
    this.engine = new BABYLON.Engine(this.canvas, true)
    this.resize()
    autoBind(this)

    document.addEventListener('DOMContentLoaded', this.startGame.bind(this))
  }

  createScene () {
    this.scene = new BABYLON.Scene(this.engine)
    this.scene.assetsManager = this.configureAssetsManager(this.scene)
    // this.scene.clearColor = new BABYLON.Color3(1, 0, 1)

    this.createFreeCamera()
    this.createLights()

    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere',
      { segments: 16, diameter: 2 }, this.scene)
    sphere.position.y = 1

    BABYLON.MeshBuilder.CreateGround('ground',
      { width: 6, height: 6, subdivisions: 2 }, this.scene)
  }

  startGame () {
    this.createScene()
    this.scene.toRender = () => {
      this.scene.render()
    }
    this.scene.assetsManager.load()
  }

  resize () {
    window.addEventListener('resize', () => {
      this.engine.resize()
    })
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
    this.freeCamera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), this.scene)
    this.freeCamera.setTarget(BABYLON.Vector3.Zero())
    this.freeCamera.attachControl(this.canvas, false)
  }

  createLights () {
    this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene)
  }

  createGround () {
    const OnGroundCreated = () => {
      const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene)
      groundMaterial.diffuseTexture = new BABYLON.Texture('images/grass.jpg', this.scene)
      this.ground.material = groundMaterial
      this.ground.checkCollisions = true
      this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(this.ground, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 }, this.scene)
    }

    this.ground = new BABYLON.Mesh.CreateGroundFromHeightMap('ground', 'images/hmap1.png', 2000, 2000, 20, 0, 1000, this.scene, false, OnGroundCreated)
  }
}
