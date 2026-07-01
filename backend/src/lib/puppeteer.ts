import puppeteer, { Browser } from 'puppeteer';

let browser: Browser | null = null;
let launching: Promise<Browser> | null = null;

export const getBrowser = async (): Promise<Browser> => {
    if (browser) return browser;

    if (!launching) {
        launching = puppeteer.launch({
            headless: true,
            ...(process.env.PUPPETEER_EXECUTABLE_PATH
                ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH }
                : {}),
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    }

    browser = await launching;
    launching = null;

    return browser;
};