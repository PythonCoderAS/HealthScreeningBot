import * as puppeteer from 'puppeteer';
import {Browser} from 'puppeteer';
import {Semaphore} from 'async-mutex';
import {CommandInteraction, User} from 'discord.js';

export let browser: Browser | null = null;
let currentlyWaiting = 0;
const semaphore = new Semaphore(4)

export enum GenerateScreenshotSendableTypeType {
    interaction,
    user
}

export interface GenerateScreenshotSendableType {
    type: GenerateScreenshotSendableTypeType
    interaction?: CommandInteraction
    user?: User
}

export interface GenerateScreenshotParams {
    sendable: GenerateScreenshotSendableType,
    firstName: string;
    lastName: string;
    email: string;
    isVaxxed?: boolean;
    deviceName?: string;
}

export async function generateScreenshot(options: GenerateScreenshotParams) {
    let didWaitInQueue = false;
    if (semaphore.isLocked()) {
        currentlyWaiting++;
        const message = `The bot is very busy, so you have been placed into a queue. You are #${currentlyWaiting} in queue.`
        switch (options.sendable.type) {
            case GenerateScreenshotSendableTypeType.interaction:
                await options.sendable.interaction.reply(message);
                break;
            case GenerateScreenshotSendableTypeType.user:
                await options.sendable.user.send(message);
                break;
        }
        didWaitInQueue = true;
    } else {
        if (options.sendable.type === GenerateScreenshotSendableTypeType.interaction) {
            await options.sendable.interaction.deferReply();
        }
    }
    await semaphore.runExclusive(async () => {
        if (browser === null) {
            browser = await puppeteer.launch({headless: true, executablePath: 'chromium-browser'})
        }

        const page = await browser.newPage();
        // await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36');
        await page.emulate(puppeteer.devices[options.deviceName])
        await page.goto('https://healthscreening.schools.nyc/?type=G');
        await page.waitForSelector('#btnDailyScreeningSubmit > button', {visible: true})

        await page.click('label[for="guest_isStudent"]')
        await page.focus("#guest_first_name")
        await page.type("#guest_first_name", options.firstName)
        await page.focus("#guest_last_name")
        await page.type("#guest_last_name", options.lastName)
        await page.focus("#guest_email")
        await page.type("#guest_email", options.email)

        await page.evaluate(() => {
            // @ts-ignore
            document.querySelector("#Location").value = "X445";
        })

        await page.click('#btnDailyScreeningSubmit > button')
        await page.waitForSelector('#q1no', {visible: true})
        await page.click("#q1no")
        await page.waitForSelector('#q2no', {visible: true})
        await page.click("#q2no")

        if (options.isVaxxed) {
            await page.waitForSelector('#q3yes', {visible: true})
            await page.click("#q3yes")
        } else {
            await page.waitForSelector('#q3yes1', {visible: true})
            await page.click("#q3yes1")
            await page.waitForSelector('#q4no', {visible: true})
            await page.click("#q4no")
        }
        await page.waitForSelector('div.question-submit > div.text-center > button.btn-primary', {visible: true})


        await page.click('div.question-submit > div.text-center > button.btn-primary');
        await page.waitForSelector("#guest_badges_content > div");

        await page.waitForSelector("#guest_badges .card-body svg", {visible: true})

        // @ts-ignore
        const screenshot: Buffer = await page.screenshot();
        await page.close()
        let message, data;
        switch (options.sendable.type) {
            case GenerateScreenshotSendableTypeType.interaction:
                message = `<@${options.sendable.interaction.user.id}>, here's your health screening:`
                data = {
                    "content": message,
                    files: [screenshot]
                }
                if (didWaitInQueue) {
                    await options.sendable.interaction.followUp(data)
                } else {
                    await options.sendable.interaction.editReply(data)
                }
                break;
            case GenerateScreenshotSendableTypeType.user:
                message = `<@${options.sendable.user.id}>, here's your health screening:`
                data = {
                    "content": message,
                    files: [screenshot]
                }
                await options.sendable.user.send(data)
                break;
        }
    })
}