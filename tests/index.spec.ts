import { test as base, expect } from "playwright/test";

const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("https://test-page.localhost/", (route) => {
      return route.fulfill({
        status: 200,
        body: `
  <html>
  <head>
    <script>
    let interval
    let timer = 0
    function startTimer() {
      if (interval) {
        return
      }

      interval = setInterval(() => {
        timer++
        document.getElementById('timer').innerHTML += 'Ticks: ' + timer + '<br>'
      }, 1000)
    }
    function stopTimer() {
      clearInterval(interval)
      interval = undefined
    }
    </script>
  </head>
  <body>
    <h1>Test Page</h1>
    <div id="timer"></div>
    <button onclick="startTimer()">Start timer</button>
    <button onclick="stopTimer()">Stop timer</button>
  </body>
  </html>`,
      });
    });

    await page.goto("https://test-page.localhost/");

    await use(page);
  },
});

test.describe("Clear intervals", () => {
  test("should clear intervals when Clock API is not used", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Start timer" }).click();

    await expect(page.getByText("Ticks: 2")).toBeVisible();

    await page.getByRole("button", { name: "Stop timer" }).click();

    await page.waitForTimeout(2000);

    await expect(page.getByText("Ticks: 2")).toBeVisible();
    await expect(page.getByText("Ticks: 3")).toBeHidden();
  });

  test("should clear intervals when Clock API is installed after interval is started", async ({
    page,
    context,
  }) => {
    // Start a background interval
    await page.getByRole("button", { name: "Start timer" }).click();

    await test.step("Install fake timer", async () => {
      context.clock.install();
    });

    await expect(page.getByText("Ticks: 2")).toBeVisible();

    // Clear a background interval
    await page.getByRole("button", { name: "Stop timer" }).click();

    await page.waitForTimeout(2000);

    await expect(page.getByText("Ticks: 2")).toBeVisible();
    await expect(page.getByText("Ticks: 3")).toBeHidden();
  });

  test("should clear intervals when Clock API method is used without clock installed", async ({
    page,
    context,
  }) => {
    // Start a background interval
    await page.getByRole("button", { name: "Start timer" }).click();

    await test.step("Tick fake timer assuming it's already installed", async () => {
      context.clock.runFor(2000);
    });

    await expect(page.getByText("Ticks: 2")).toBeVisible();

    // Clear a background interval
    await page.getByRole("button", { name: "Stop timer" }).click();

    await page.waitForTimeout(2000);

    await expect(page.getByText("Ticks: 2")).toBeVisible();
    await expect(page.getByText("Ticks: 3")).toBeHidden();
  });
});
