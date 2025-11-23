// ============================================================================
// NOTIFICATION UTILITY
// ============================================================================
// Provides reusable notification feedback mechanism
// ============================================================================

import { Time } from './time';

export interface NotificationParams {
    readonly message: string;
    readonly delay?: number;
    readonly duration: number;
    readonly scene: BABYLON.Scene;
    readonly background?: string;
    readonly color?: string;
    readonly padding?: string;
    readonly borderRadius?: string;
    readonly fontSize?: string;
    readonly fontWeight?: string;
    readonly position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    readonly zIndex?: number;
}

export class Notification {
    /**
     * Creates and displays a notification with the specified parameters
     * @param params Notification parameters including message, timing, and styling
     */
    public static create(params: NotificationParams): void {
        const delay = params.delay ?? 0;
        const duration = params.duration;
        const scene = params.scene;

        // Create the notification element
        const notification = document.createElement('div');
        
        // Set position styles
        const positionStyles = this.getPositionStyles(params.position ?? 'center');
        
        // Build CSS styles
        const styles: string[] = [
            'position: fixed',
            ...positionStyles,
            `background: ${params.background ?? 'rgba(0, 0, 0, 0.9)'}`,
            `color: ${params.color ?? 'white'}`,
            `padding: ${params.padding ?? '20px'}`,
            `border-radius: ${params.borderRadius ?? '10px'}`,
            `z-index: ${params.zIndex ?? 9999}`,
            `font-size: ${params.fontSize ?? '18px'}`,
            `font-weight: ${params.fontWeight ?? 'bold'}`,
        ];

        notification.style.cssText = styles.join('; ');
        notification.textContent = params.message;

        // Function to show the notification
        const showNotification = (): void => {
            document.body.appendChild(notification);
            
            // Schedule removal after duration
            Time.runDelayed(scene, duration, () => {
                notification.remove();
            });
        };

        // Show immediately or after delay
        if (delay <= 0) {
            showNotification();
        } else {
            Time.runDelayed(scene, delay, showNotification);
        }
    }

    /**
     * Gets CSS position styles based on position parameter
     * @param position The position type
     * @returns Array of CSS position style strings
     */
    private static getPositionStyles(position: NotificationParams['position']): string[] {
        switch (position) {
            case 'center':
                return [
                    'top: 50%',
                    'left: 50%',
                    'transform: translate(-50%, -50%)',
                ];
            case 'top':
                return [
                    'top: 20px',
                    'left: 50%',
                    'transform: translateX(-50%)',
                ];
            case 'bottom':
                return [
                    'bottom: 20px',
                    'left: 50%',
                    'transform: translateX(-50%)',
                ];
            case 'left':
                return [
                    'top: 50%',
                    'left: 20px',
                    'transform: translateY(-50%)',
                ];
            case 'right':
                return [
                    'top: 50%',
                    'right: 20px',
                    'transform: translateY(-50%)',
                ];
            case 'top-left':
                return [
                    'top: 20px',
                    'left: 20px',
                ];
            case 'top-right':
                return [
                    'top: 20px',
                    'right: 20px',
                ];
            case 'bottom-left':
                return [
                    'bottom: 20px',
                    'left: 20px',
                ];
            case 'bottom-right':
                return [
                    'bottom: 20px',
                    'right: 20px',
                ];
            default:
                return [
                    'top: 50%',
                    'left: 50%',
                    'transform: translate(-50%, -50%)',
                ];
        }
    }
}

