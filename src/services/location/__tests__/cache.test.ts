import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchLocationMock } = vi.hoisted(() => ({
  fetchLocationMock: vi.fn(),
}));

vi.mock("../index", () => ({
  defaultLocationService: {
    fetchLocation: fetchLocationMock,
  },
}));

import { clearLocationCache, getCachedLocationData } from "../cache";

const sampleLocation = {
  ip: "1.2.3.4",
  network: "net",
  version: "IPv4",
  city: "Pune",
  region: "MH",
  region_code: "MH",
  country: "IN",
  country_name: "India",
  country_code: "IN",
  country_code_iso3: "IND",
  country_capital: "Delhi",
  country_tld: ".in",
  continent_code: "AS",
  in_eu: false,
  postal: "411001",
  latitude: 1,
  longitude: 2,
  timezone: "Asia/Kolkata",
  utc_offset: "+0530",
  country_calling_code: "+91",
  currency: "INR",
  currency_name: "Rupee",
  languages: "en",
  country_area: 1,
  country_population: 1,
  asn: "asn",
  org: "org",
};

describe("location cache", () => {
  beforeEach(() => {
    clearLocationCache();
    fetchLocationMock.mockReset();
    window.sessionStorage.clear();
  });

  it("fetches from ipapi on first request", async () => {
    fetchLocationMock.mockResolvedValueOnce(sampleLocation);

    const result = await getCachedLocationData();

    expect(result).toEqual(sampleLocation);
    expect(fetchLocationMock).toHaveBeenCalledTimes(1);
  });

  it("reuses in-memory cache for repeated requests", async () => {
    fetchLocationMock.mockResolvedValueOnce(sampleLocation);

    await getCachedLocationData();
    const second = await getCachedLocationData();

    expect(second).toEqual(sampleLocation);
    expect(fetchLocationMock).toHaveBeenCalledTimes(1);
  });

  it("reuses session storage cache after memory reset", async () => {
    fetchLocationMock.mockResolvedValueOnce(sampleLocation);
    await getCachedLocationData();

    clearLocationCache();
    window.sessionStorage.setItem("sumitsute.location-data", JSON.stringify(sampleLocation));

    const result = await getCachedLocationData();

    expect(result).toEqual(sampleLocation);
    expect(fetchLocationMock).toHaveBeenCalledTimes(1);
  });

  it("does not cache failed lookups", async () => {
    fetchLocationMock.mockResolvedValueOnce(null);
    fetchLocationMock.mockResolvedValueOnce(sampleLocation);

    const first = await getCachedLocationData();
    const second = await getCachedLocationData();

    expect(first).toBeNull();
    expect(second).toEqual(sampleLocation);
    expect(fetchLocationMock).toHaveBeenCalledTimes(2);
  });
});
