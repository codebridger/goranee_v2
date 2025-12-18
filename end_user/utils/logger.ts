/**
 * General logger utility that only logs in development mode.
 * 
 * @param tag - A tag to identify the log source (e.g., 'Cache', 'Auth')
 * @param message - The message to log
 * @param data - Optional data to log along with the message
 */
export const devLog = (tag: string, message: string, data?: any) => {
  if (import.meta.dev) {
    const time = new Date().toLocaleTimeString();
    const prefix = `[${time}] [${tag}]`;
    
    if (data !== undefined) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
};

