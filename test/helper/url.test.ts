import { getCodeFromPath, getCodeFromPathWithOptionalSubResource, getCodeFromRoute, isRetailerRequest } from "../../src/helpers/url";
import { Request } from "@google-cloud/functions-framework";

describe("url helpers", () => {
  describe("isRetailerRequest", () => {
    it('assets that true is returned when "retailer" in path', () => {
      const req = { path: "/retailer/example" } as Request;
      const result = isRetailerRequest(req);
      expect(result).toEqual(true);
    });

    it('assets that false is returned when "retailer" is not in path', () => {
      const req = { path: "/example" } as Request;
      const result = isRetailerRequest(req);
      expect(result).toEqual(false);
    });
  });

  describe("getCodeFromPath", () => {
    it("assets code is extracted from path", () => {
      const req = { path: "/example/ABC" } as Request;
      const result = getCodeFromPath("example", req);
      expect(result).toEqual("ABC");
    });

    it("assets error if no code found", () => {
      const req = { path: "/" } as Request;
      expect(() => {
        getCodeFromPath("example", req)
      }).toThrow('example code not found in path');
    });
  });


  describe("getCodeFromPathWithOptionalSubResource", () => {
    it("assets code is extracted from route", () => {
      const req = { path: "/example/ABC" } as Request;
      const result = getCodeFromPathWithOptionalSubResource("example","state", req);
      expect(result).toEqual("ABC");
    });
    it("assets code is extracted from route, with sub resource", () => {
      const req = { path: "/example/ABC/state" } as Request;
      const result = getCodeFromPathWithOptionalSubResource("example","state", req);
      expect(result).toEqual("ABC");
    });
    it("assets code is extracted from route, with missing sub resource", () => {
      const req = { path: "/example/ABC" } as Request;
      const result = getCodeFromPathWithOptionalSubResource("example","state", req);
      expect(result).toEqual("ABC");
    });

    it("assets code is extracted from api gateway route, with sub resource", () => {
      const req = { path: "/api/v1/catalog/sku/ABC/state" } as Request;
      const result = getCodeFromPathWithOptionalSubResource("example","state", req);
      expect(result).toEqual("ABC");
    });

    it("assets error thrown if only sub resource supplied", () => {
      const req = { path: "/state" } as Request;
      expect(() => {
        getCodeFromPathWithOptionalSubResource("example","state", req)
      }).toThrow('example code not found in path');
    });
  });

  describe("getCodeFromRoute", () => {
    it("assets code is extracted from route", () => {
      const req = { path: "/example/ABC" } as Request;
      const result = getCodeFromRoute("(.*)/:code","example", req);
      expect(result).toEqual("ABC");
    });
    it("assets error thrown if code not found", () => {
      const req = { path: "/example/ABC" } as Request;
      expect(() => {
        getCodeFromRoute("(.*)/","example", req)
      }).toThrow('example code not found in path');
    });
  });

});

