import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { getProducts } from "@/lib/catalog";
import { ProductSlider } from "@/components/product-slider";
import { CATEGORY_TILES } from "@/lib/categories";
import { Reveal } from "@/components/reveal";
import { HeroMotion } from "@/components/hero-motion";


const MEDICLINIC_IMAGE = "/consultation-image.webp";

const INSURERS = ["Aetna", "Bupa", "Cigna", "Continuum", "Discovery"];

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.filter((p) => p.stock > 0).slice(0, 4);

  return (
    <div className="space-y-24">
      {/* Full-bleed hero: breaks out of the page container and fills the visible screen below the navbars. */}
      <section className="relative -mt-10 flex h-[calc(100svh-10rem)] min-h-[520px] left-1/2 w-screen -translate-x-1/2 items-center overflow-hidden bg-ink text-white">
        <Image
          src="/hero-image.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/10" />
        <HeroMotion />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-32 sm:px-8">
          <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-white">Link Pharmacy</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Pharmacy care,<br/> all in one place.
          </h1>
          <p className="mt-5 text-lg text-white/85">
            Shop essentials, send a prescription<br/> or explore Link Mediclinic.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="inline-flex items-center gap-3 rounded-md bg-brand px-6 py-3 font-semibold text-ink shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-hover">
              Shop products
              <span aria-hidden className="h-5 w-px bg-ink/30" />
              <Icon icon="lucide:arrow-right" aria-hidden />
            </Link>
            <Link href="/prescriptions" className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-semibold text-ink shadow-lg transition hover:-translate-y-0.5">
              Upload prescription
              <Icon icon="lucide:upload" aria-hidden />
            </Link>
          </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-3 px-4 pb-4 sm:px-8">
            <Link
              href="/info/mediclinic"
              className="inline-flex h-16 items-center gap-3 rounded-md bg-ink px-4 text-white shadow-lg transition hover:bg-ink/85"
            >
              <Icon icon="tabler:first-aid-kit" className="h-6 w-6 shrink-0 text-brand" aria-hidden />
              <span>
                <span className="block font-semibold">Explore Link Mediclinic</span>
                <span className="block text-sm text-white/75">Clinic services and appointments</span>
              </span>
              <Icon icon="lucide:arrow-right" className="h-5 w-5 shrink-0 text-brand" aria-hidden />
            </Link>
            <Link
              href="/find-a-pharmacy"
              className="inline-flex h-16 items-center gap-3 rounded-md bg-white px-4 text-ink shadow-lg transition hover:bg-slate-50"
            >
              <Icon icon="lucide:map-pin" className="h-6 w-6 shrink-0 text-brand" aria-hidden />
              <span>
                <span className="block font-semibold">Find a pharmacy</span>
                <span className="block text-sm text-muted">Locations and opening hours</span>
              </span>
              <Icon icon="lucide:arrow-right" className="h-5 w-5 shrink-0 text-ink" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section>
        <Reveal>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/plus-medical.svg" alt="" aria-hidden className="h-7 w-7" />
            Shop by category
          </h2>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {CATEGORY_TILES.map((tile, i) => (
            <Reveal key={tile.name} delay={i * 0.05}>
              <Link
                href={`/shop?category=${encodeURIComponent(tile.name)}`}
                style={{ backgroundColor: tile.bg }}
                className="group flex flex-col items-stretch justify-between gap-3 sm:flex-row overflow-hidden rounded-sm border border-slate-200 p-3 pl-4 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
              >
                <span className="flex min-w-0 flex-col items-start justify-between self-stretch py-1">
                  <span className="text-sm font-semibold leading-snug text-ink">{tile.name}</span>
                  <Icon
                    icon="lucide:arrow-right"
                    className="h-4 w-4 text-ink transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.image}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 shrink-0 self-end rounded-sm object-contain sm:h-20 sm:w-20 sm:self-auto"
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="rounded-3xl bg-[#F7F9F6] p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-5">
            <Reveal className="flex flex-col items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/plus-medical.svg" alt="" aria-hidden className="h-10 w-10" />
              <h2 className="text-2xl font-bold leading-tight">
                Everyday<br />Essentials
              </h2>
              <p className="text-muted">Explore products for your daily routine.</p>
              <Link
                href="/shop"
                className="mt-2 inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-md bg-brand px-3 py-2 text-xs font-semibold text-ink transition hover:bg-brand-hover"
              >
                Browse all products
                <span aria-hidden className="h-4 w-px bg-ink/40" />
                <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>

            <Reveal className="min-w-0 lg:col-span-4">
              <ProductSlider products={featured} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Mediclinic promo. Image is set by MEDICLINIC_IMAGE. */}
      <section className="overflow-hidden rounded-sm bg-white shadow-sm">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-72 md:min-h-96">
            <Image src={MEDICLINIC_IMAGE} alt="Link Mediclinic" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="relative isolate flex flex-col justify-center gap-5 overflow-hidden bg-ink p-8 text-white sm:p-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/plus-medical-lg.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -bottom-6 -right-6 -z-10 w-40"
            />
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">Link Mediclinic</p>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">Care beyond the pharmacy.</h2>
            <p className="text-lg text-white/80">Explore clinic services and information for your visit.</p>
            <Link
              href="/info/mediclinic"
              className="inline-flex w-fit items-center gap-2 rounded-md bg-brand px-5 py-3 font-semibold text-ink transition hover:bg-brand-hover"
            >
              Explore Mediclinic
              <span aria-hidden className="h-4 w-px bg-ink/40" />
              <Icon icon="lucide:arrow-right" className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Insurance partners: title in the first column, one logo per remaining column. */}
      <section className="grid grid-cols-2 items-center gap-x-6 gap-y-8 rounded-sm bg-white p-6 sm:grid-cols-3 sm:p-8 md:grid-cols-6">
        <h2 className="col-span-2 text-xl font-bold leading-tight text-ink sm:col-span-3 md:col-span-1">Insurance at Mediclinic</h2>
        {INSURERS.map((name, i) => (
          <div key={name} className={`flex h-12 items-center justify-center sm:h-16 ${i === INSURERS.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/insurance/${name}.svg`} alt={name} loading="lazy" className="max-h-full w-auto max-w-full object-contain" />
          </div>
        ))}
      </section>

      {/* App promotion: text and image on the left, white download box across the bottom. */}
      <section className="rounded-sm bg-[#F4F8D5] p-6 sm:p-10">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-ink">The Link app</p>
            <h2 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">Take Link with you.</h2>
            <p className="text-lg text-muted">Download the Link Pharmacy app.</p>

            <div className="mt-2 flex w-fit max-w-full flex-col items-center gap-3 rounded-sm bg-white p-3 sm:flex-row sm:p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/qr-code.svg" alt="QR code to download the app" className="h-16 w-16 shrink-0" />
              <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                <h3 className="text-base font-bold text-ink">Scan to download</h3>
                <p className="text-sm text-muted">Or choose your app store</p>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  {/* TODO: replace placeholder hrefs with the real store listing URLs. */}
                  <a href="#">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/app-store.svg" alt="Download on the App Store" className="block h-7 w-auto" />
                  </a>
                  <a href="#">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/play-store.svg" alt="Get it on Google Play" className="block h-7 w-auto" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/app-promotion.svg" alt="Link Pharmacy app" loading="lazy" className="mx-auto h-48 w-auto max-w-full object-contain sm:h-72 lg:h-96" />
        </div>
      </section>
    </div>
  );
}
