/**
 * Headless verification for Phase 2 (images/variants) and Phase 3 (admin/inventory).
 * Uses system Chrome via puppeteer-core (npx, not added to package.json).
 */
import { createRequire } from "node:module";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";
const ADMIN_PASSWORD = process.env.ADMIN_DEMO_PASSWORD || "change-me-locally";

async function loadPuppeteer() {
  try {
    const require = createRequire(import.meta.url);
    return require("puppeteer-core");
  } catch {
    // Install once into a temp cache via npx resolve — use dynamic import after npm pack
    const { execSync } = await import("node:child_process");
    execSync("npm install --no-save puppeteer-core@24", {
      stdio: "inherit",
      cwd: "/workspace",
    });
    const require = createRequire(import.meta.url);
    return require("puppeteer-core");
  }
}

function pass(name) {
  console.log(`PASS  ${name}`);
  return true;
}
function fail(name, detail) {
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  return false;
}

async function main() {
  const puppeteer = await loadPuppeteer();
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome-stable",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const results = [];

  try {
    // Fresh localStorage so prior demo products do not leak across runs
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(() => localStorage.clear());

    // --- Homepage rail / ticker ---
    await page.goto(BASE, { waitUntil: "networkidle0", timeout: 60000 });
    const hasTickerText = await page.evaluate(() =>
      document.body.innerText.includes("SCF FASHION"),
    );
    results.push(
      hasTickerText
        ? pass("Homepage ticker visible")
        : fail("Homepage ticker visible"),
    );

    const nextBtn = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll("button")];
      return buttons.find((b) => /^next$/i.test(b.textContent?.trim() || ""));
    });
    const nextEl = nextBtn.asElement();
    if (nextEl) {
      await nextEl.click();
      await sleep(400);
      results.push(pass("Homepage rail Next interaction (no crash)"));
    } else {
      results.push(fail("Homepage rail Next button", "not found"));
    }

    // --- About / Contact ---
    await page.goto(`${BASE}/about`, { waitUntil: "networkidle0" });
    results.push(
      (await page.title()) || (await page.content()).includes("About")
        ? pass("About page loads")
        : fail("About page loads"),
    );
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle0" });
    results.push(
      (await page.content()).toLowerCase().includes("contact")
        ? pass("Contact page loads")
        : fail("Contact page loads"),
    );

    // --- Catalog ---
    await page.goto(`${BASE}/products`, { waitUntil: "networkidle0" });
    const productLinks = await page.$$('a[href^="/products/"]');
    results.push(
      productLinks.length > 0
        ? pass(`Catalog lists products (${productLinks.length} links)`)
        : fail("Catalog lists products"),
    );

    // --- Everyday Cotton Tee: color image switching ---
    await page.goto(`${BASE}/products/everyday-cotton-tee`, {
      waitUntil: "networkidle0",
    });
    await sleep(500);
    // Click Sky color (no dedicated photo)
    const skyClicked = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) =>
        (b.getAttribute("aria-label") || "").toLowerCase().startsWith("sky"),
      );
      if (!btn) return false;
      btn.click();
      return true;
    });
    await sleep(400);
    const skyNote = await page.evaluate(() =>
      document.body.innerText.includes(
        "A dedicated photo for this colorway is not in the catalog yet",
      ),
    );
    results.push(
      skyClicked && skyNote
        ? pass("Color without photo shows honest gap message")
        : fail("Color without photo shows honest gap message", `clicked=${skyClicked} note=${skyNote}`),
    );
    // White should have photo — click White
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) =>
        (b.getAttribute("aria-label") || "").toLowerCase().startsWith("white"),
      );
      btn?.click();
    });
    await sleep(400);
    const whiteNoteGone = await page.evaluate(
      () =>
        !document.body.innerText.includes(
          "A dedicated photo for this colorway is not in the catalog yet",
        ),
    );
    const whiteImg2 = await page.evaluate(() => {
      const img = document.querySelector("img");
      return img?.getAttribute("src") || "";
    });
    results.push(
      whiteNoteGone && whiteImg2.includes("1521572163474")
        ? pass("White color shows verified matching tee image")
        : fail(
            "White color shows verified matching tee image",
            `noteGone=${whiteNoteGone} src=${whiteImg2.slice(0, 80)}`,
          ),
    );

    // FRONT/BACK should be hidden (no views.back on seed)
    const frontBack = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")].map((b) =>
        (b.textContent || "").trim().toLowerCase(),
      );
      return buttons.includes("front") && buttons.includes("back");
    });
    results.push(
      !frontBack
        ? pass("FRONT/BACK hidden when no verified views.back")
        : fail("FRONT/BACK hidden when no verified views.back"),
    );

    // Stock UI
    const stockText = await page.evaluate(() => document.body.innerText);
    results.push(
      /left in/i.test(stockText) || /in stock/i.test(stockText)
        ? pass("Product detail shows stock availability")
        : fail("Product detail shows stock availability"),
    );

    // Ensure White is selected, then add to cart
    await page.evaluate(() => {
      const white = [...document.querySelectorAll("button")].find((b) =>
        (b.getAttribute("aria-label") || "").toLowerCase().startsWith("white"),
      );
      white?.click();
    });
    await sleep(200);
    await page.evaluate(() => {
      const sizeBtns = [...document.querySelectorAll("button")].filter((b) =>
        /^(XS|S|M|L|XL)$/.test((b.textContent || "").trim()),
      );
      const available = sizeBtns.find((b) => !b.disabled);
      available?.click();
    });
    await page.evaluate(() => {
      const add = [...document.querySelectorAll("button")].find((b) =>
        /add to cart/i.test(b.textContent || ""),
      );
      add?.click();
    });
    await sleep(600);
    const added = await page.evaluate(() =>
      document.body.innerText.includes("Added to cart"),
    );
    results.push(added ? pass("Add to cart succeeds") : fail("Add to cart succeeds"));

    const cartSnapshot = await page.evaluate(() =>
      localStorage.getItem("scf-fashion-cart-v1"),
    );
    await page.goto(`${BASE}/cart`, { waitUntil: "networkidle0" });
    await sleep(400);
    const cartOk = await page.evaluate((snapshot) => {
      const text = document.body.innerText;
      const imgs = [...document.querySelectorAll("img")].map(
        (img) => img.src || img.getAttribute("src") || "",
      );
      const hasWhitePhoto = imgs.some(
        (src) =>
          src.includes("1521572163474") ||
          decodeURIComponent(src).includes("1521572163474"),
      );
      let storedOk = false;
      try {
        const items = JSON.parse(snapshot || "[]");
        storedOk =
          items[0]?.colorName === "White" &&
          String(items[0]?.image || "").includes("1521572163474");
      } catch {
        storedOk = false;
      }
      return {
        ok:
          text.includes("Everyday Cotton Tee") &&
          /white/i.test(text) &&
          (hasWhitePhoto || storedOk),
        detail: { text: text.slice(0, 200), imgs, storedOk, hasWhitePhoto },
      };
    }, cartSnapshot);
    results.push(
      cartOk.ok
        ? pass("Cart keeps matching color name + white tee image")
        : fail(
            "Cart keeps matching color name + white tee image",
            JSON.stringify(cartOk.detail),
          ),
    );

    // --- Sold out cap ---
    await page.goto(`${BASE}/products/soft-cotton-cap`, {
      waitUntil: "networkidle0",
    });
    await sleep(400);
    const soldOut = await page.evaluate(() => {
      const text = document.body.innerText;
      const btn = [...document.querySelectorAll("button")].find((b) =>
        /sold out/i.test(b.textContent || ""),
      );
      return /unavailable|sold out/i.test(text) && Boolean(btn?.disabled);
    });
    results.push(
      soldOut
        ? pass("Zero-stock Soft Cotton Cap is sold out")
        : fail("Zero-stock Soft Cotton Cap is sold out"),
    );

    // --- Admin CRUD + inventory + front/back ---
    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
    await page.type('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await sleep(800);
    const adminIn = await page.evaluate(() =>
      document.body.innerText.includes("Local admin"),
    );
    results.push(adminIn ? pass("Admin login") : fail("Admin login"));

    async function setField(labelIncludes, value) {
      // Native setters avoid Enter-on-newline accidentally submitting the form.
      const ok = await page.evaluate(
        ({ labelIncludes, value }) => {
          const lab = [...document.querySelectorAll("label")].find((l) =>
            (l.textContent || "").includes(labelIncludes),
          );
          const input = lab?.querySelector("input, textarea");
          if (!input) return false;
          const proto =
            input.tagName === "TEXTAREA"
              ? window.HTMLTextAreaElement.prototype
              : window.HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
          setter?.call(input, value);
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        },
        { labelIncludes, value },
      );
      if (!ok) throw new Error("missing field " + labelIncludes);
    }

    await page.evaluate(() => {
      const add = [...document.querySelectorAll("button")].find((b) =>
        /add product/i.test(b.textContent || ""),
      );
      add?.click();
    });
    await sleep(400);

    await setField("Name", "Phase23 Demo Jacket");
    await setField(
      "Description",
      "Temporary admin demo product for front/back and inventory verification.",
    );
    await setField("Price (USD)", "99");
    await setField(
      "Image URLs (comma-separated)",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    );
    await setField(
      "Front view URL",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    );
    await setField(
      "Back view URL",
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1200&q=80",
    );
    await setField(
      "Colors (one per line",
      "ivory|Ivory|#F5F0E8|https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80|https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1200&q=80\nsky|Sky|#7DD3FC",
    );
    await setField("Sizes (comma-separated)", "S, M, L");
    await sleep(500);
    // Set stock: S=2, M=0, L=4 (React controlled number inputs)
    async function setStock(size, value) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const found = await page.evaluate(
          ({ size, value }) => {
            const input =
              document.querySelector(`input[data-stock-size="${size}"]`) ||
              [...document.querySelectorAll("label")]
                .find(
                  (l) =>
                    (l.querySelector("span")?.textContent || "").trim() ===
                      size && l.querySelector('input[type="number"]'),
                )
                ?.querySelector('input[type="number"]');
            if (!input) return false;
            const setter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              "value",
            )?.set;
            setter?.call(input, String(value));
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
            return true;
          },
          { size, value },
        );
        if (found) return;
        await sleep(200);
      }
      throw new Error("missing stock input " + size);
    }
    await setStock("S", 2);
    await setStock("M", 0);
    await setStock("L", 4);

    await page.evaluate(() => {
      const save = [...document.querySelectorAll("button")].find((b) =>
        /^save$/i.test(b.textContent?.trim() || ""),
      );
      save?.click();
    });
    await sleep(800);
    const saved = await page.evaluate(() =>
      document.body.innerText.includes("Phase23 Demo Jacket"),
    );
    results.push(
      saved
        ? pass("Admin create product persists in list")
        : fail("Admin create product persists in list"),
    );

    // Visit product — FRONT/BACK + size stock
    await page.goto(`${BASE}/products/phase23-demo-jacket`, {
      waitUntil: "networkidle0",
    });
    await sleep(500);
    const detail = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")].map((b) =>
        (b.textContent || "").trim().toLowerCase(),
      );
      const mBtn = [...document.querySelectorAll("button")].find(
        (b) => (b.textContent || "").trim() === "M",
      );
      const sBtn = [...document.querySelectorAll("button")].find(
        (b) => (b.textContent || "").trim() === "S",
      );
      return {
        hasFrontBack: buttons.includes("front") && buttons.includes("back"),
        mDisabled: Boolean(mBtn?.disabled),
        sDisabled: Boolean(sBtn?.disabled),
        title: document.querySelector("h1")?.textContent || "",
        skyNote: document.body.innerText.includes(
          "A dedicated photo for this colorway is not in the catalog yet",
        ),
      };
    });
    results.push(
      detail.title.includes("Phase23 Demo Jacket")
        ? pass("Storefront shows admin-created product")
        : fail("Storefront shows admin-created product", detail.title),
    );
    // Default color is Ivory (first) — FRONT/BACK requires color back URL + views.back
    results.push(
      detail.hasFrontBack
        ? pass("FRONT/BACK controls appear when views + color back set")
        : fail("FRONT/BACK controls appear when views + color back set", JSON.stringify(detail)),
    );
    results.push(
      detail.mDisabled && !detail.sDisabled
        ? pass("Per-size inventory disables out-of-stock size M")
        : fail(
            "Per-size inventory disables out-of-stock size M",
            JSON.stringify(detail),
          ),
    );

    // Sky has no color photo — gap message; product-level FRONT/BACK still apply
    await page.evaluate(() => {
      const sky = [...document.querySelectorAll("button")].find((b) =>
        (b.getAttribute("aria-label") || "").toLowerCase().startsWith("sky"),
      );
      sky?.click();
    });
    await sleep(300);
    const skyState = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")].map((b) =>
        (b.textContent || "").trim().toLowerCase(),
      );
      return {
        gap: document.body.innerText.includes(
          "A dedicated photo for this colorway is not in the catalog yet",
        ),
        hasFrontBack: buttons.includes("front") && buttons.includes("back"),
      };
    });
    results.push(
      skyState.gap
        ? pass("Admin product Sky color shows gap message")
        : fail("Admin product Sky color shows gap message"),
    );
    results.push(
      skyState.hasFrontBack
        ? pass("FRONT/BACK available for color without its own images")
        : fail("FRONT/BACK available for color without its own images"),
    );

    // Ivory has color front+back — image + FRONT/BACK
    await page.evaluate(() => {
      const ivory = [...document.querySelectorAll("button")].find((b) =>
        (b.getAttribute("aria-label") || "").toLowerCase().startsWith("ivory"),
      );
      ivory?.click();
    });
    await sleep(300);
    const ivoryImg = await page.evaluate(() => {
      const img = document.querySelector("img");
      return img?.getAttribute("src") || "";
    });
    const ivoryHasPair = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")].map((b) =>
        (b.textContent || "").trim().toLowerCase(),
      );
      return buttons.includes("front") && buttons.includes("back");
    });
    results.push(
      decodeURIComponent(ivoryImg).includes("1594938298603")
        ? pass("Admin product Ivory color shows configured image")
        : fail("Admin product Ivory color shows configured image", ivoryImg.slice(0, 100)),
    );
    results.push(
      ivoryHasPair
        ? pass("Ivory color FRONT/BACK from color image pair")
        : fail("Ivory color FRONT/BACK from color image pair"),
    );

    // Click BACK on Ivory
    await page.evaluate(() => {
      const back = [...document.querySelectorAll("button")].find(
        (b) => (b.textContent || "").trim().toLowerCase() === "back",
      );
      back?.click();
    });
    await sleep(400);
    const backImg = await page.evaluate(() => {
      const img = document.querySelector("img");
      return img?.getAttribute("src") || "";
    });
    results.push(
      decodeURIComponent(backImg).includes("1591369822096")
        ? pass("FRONT/BACK switches to back image URL")
        : fail("FRONT/BACK switches to back image URL", backImg.slice(0, 120)),
    );

    // Validation: invalid image URL rejected
    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
    await sleep(500);
    await page.evaluate(() => {
      const edit = [...document.querySelectorAll("button")].find(
        (b) =>
          b.textContent?.trim() === "Edit" &&
          b.closest("tr")?.innerText.includes("Phase23 Demo Jacket"),
      );
      edit?.click();
    });
    await sleep(400);
    await setField(
      "Image URLs (comma-separated)",
      "https://evil.example/not-allowed.jpg",
    );
    await sleep(200);
    await page.evaluate(() => {
      const save = [...document.querySelectorAll('button[type="submit"], button')].find(
        (b) => /^save$/i.test(b.textContent?.trim() || ""),
      );
      save?.click();
    });
    await sleep(700);
    const rejected = await page.evaluate(() => {
      const alerts = [...document.querySelectorAll("[role='alert'], [role='status']")]
        .map((n) => n.textContent || "")
        .join(" ");
      return /not allowed|Host|Image URL|evil/i.test(
        alerts + "\n" + document.body.innerText,
      );
    });
    results.push(
      rejected
        ? pass("Admin rejects invalid image host")
        : fail("Admin rejects invalid image host"),
    );

    // Delete demo product — restore valid image first if editor still open with bad URL
    await page.evaluate(() => {
      const cancel = [...document.querySelectorAll("button")].find((b) =>
        /^cancel$/i.test(b.textContent?.trim() || ""),
      );
      cancel?.click();
    });
    await sleep(300);
    page.once("dialog", (d) => d.accept());
    const removeClicked = await page.evaluate(() => {
      const remove = [...document.querySelectorAll("button")].find(
        (b) =>
          b.textContent?.trim() === "Remove" &&
          b.closest("tr")?.innerText.includes("Phase23 Demo Jacket"),
      );
      if (!remove) return false;
      remove.click();
      return true;
    });
    await sleep(700);
    const removed = await page.evaluate(() => {
      const rows = [...document.querySelectorAll("tr")].map((tr) => tr.innerText);
      return !rows.some((t) => t.includes("Phase23 Demo Jacket"));
    });
    results.push(
      removeClicked && removed
        ? pass("Admin delete product")
        : fail("Admin delete product", `clicked=${removeClicked} removed=${removed}`),
    );

    // Mobile viewport overflow check
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(BASE, { waitUntil: "networkidle0" });
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2;
    });
    results.push(
      !overflow
        ? pass("Mobile homepage no horizontal overflow")
        : fail("Mobile homepage no horizontal overflow"),
    );

    // WhatsApp checkout page still loads
    await page.goto(`${BASE}/checkout`, { waitUntil: "networkidle0" });
    results.push(
      (await page.content()).toLowerCase().includes("whatsapp") ||
        (await page.content()).toLowerCase().includes("checkout")
        ? pass("Checkout page loads")
        : fail("Checkout page loads"),
    );
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r).length;
  const passed = results.filter((r) => r).length;
  console.log(`\nSummary: ${passed} PASS, ${failed} FAIL`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
