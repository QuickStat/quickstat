// IMPORTANT: NOT RELEVANT -> Just spins up some pm2 processes for testing
import path from 'path'
import pm2 from 'pm2'

/**
 * Spins up some pm2 processes for testing
 */
export class DemoProcessManager {
  /**
   * List of app names
   */
  appNames: string[]

  /**
   * Declare the app names
   */
  constructor() {
    this.appNames = [
      'express-app',
      'redis-broker',
      'ws-gateway',
      'auth-service',
      'frontend-server',
      'cache-service',
      'database-worker',
      'notification-service',
      'monitoring-dashboard',
    ]
  }

  /**
   * Start the apps
   */
  start(): void {
    this.appNames.forEach(appName => {
      this.startApp(appName)
    })

    // Delete all after process exit
    process.on('exit', () => {
      this.appNames.forEach(appName => {
        this.deleteApp(appName)
      })
    })
  }

  /**
   * Start the app
   * @param appName The app name
   */
  private startApp(appName: string): void {
    pm2.connect((err: Error) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }

      pm2.start({
        script: path.join('dist', 'pm2', 'process.js'),
        name: appName,
        autorestart: true,
        max_memory_restart: '100M',
      }, (err: Error) => {
        if (err) {
          console.error(err)
          pm2.disconnect()
          return
        }

        console.log(`Started process with name ${appName}`)
        pm2.disconnect()
      })
    })
  }

  /**
   * Delete the app
   * @param appName The app name to delete
   */
  private deleteApp(appName: string): void {
    pm2.connect((err: Error) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }

      pm2.delete(appName, (err: Error) => {
        if (err) {
          console.error(err)
          pm2.disconnect()
          return
        }

        console.log(`Deleted process with name ${appName}`)
        pm2.disconnect()
      })
    })
  }
}
