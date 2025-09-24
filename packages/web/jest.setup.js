// jest.setup.js
import "@testing-library/jest-dom";

if (typeof Intl !== "undefined" && Intl.NumberFormat) {
  const descriptor = Object.getOwnPropertyDescriptor(
    Intl.NumberFormat.prototype,
    "format"
  );

  if (
    descriptor &&
    typeof descriptor.get === "function" &&
    !descriptor.get.__snowvaPatched
  ) {
    const originalGet = descriptor.get;

    const patchedGet = function patchedGet() {
      const boundFormat = originalGet.call(this);

      return (...args) => {
        const result = boundFormat(...args);
        return typeof result === "string"
          ? result.replace(/\u00a0/g, " ")
          : result;
      };
    };

    Object.defineProperty(Intl.NumberFormat.prototype, "format", {
      configurable: descriptor.configurable ?? true,
      enumerable: descriptor.enumerable ?? false,
      get: patchedGet,
    });

    Object.defineProperty(patchedGet, "__snowvaPatched", {
      value: true,
      enumerable: false,
    });
  }
}
