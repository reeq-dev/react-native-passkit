import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const nativePass = {
  passTypeIdentifier: 'pass.com.example',
  serialNumber: '123',
  passType: 'barcode',
  organizationName: 'Example',
  localizedName: 'Event Ticket',
  localizedDescription: 'Ticket',
  deviceName: 'iPhone',
  isRemotePass: false,
  relevantDates: [{ date: 1000 }, { startDate: 2000, endDate: 3000 }],
  userInfo: { seat: '12A' },
};

const mockNative = {
  canAddPasses: jest.fn(async (_format: string) => true),
  addPass: jest.fn(async (_pass: string) => undefined),
  addPasses: jest.fn(async (_passes: string[]) => undefined),
  addPassJWT: jest.fn(async (_jwt: string) => undefined),
  getWalletName: jest.fn(async () => 'Apple Wallet'),
  isPassLibraryAvailable: jest.fn(async () => true),
  containsPass: jest.fn(async (_pass: string) => true),
  getPasses: jest.fn(async () => [nativePass]),
  getPass: jest.fn(async (_type: string, _serial: string) => nativePass),
  getPassFieldValue: jest.fn(async () => 'Row 1'),
  replacePass: jest.fn(async (_pass: string) => true),
  removePass: jest.fn(async () => undefined),
  openPass: jest.fn(async () => undefined),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};

jest.mock('../NativeReactNativePasskit', () => ({
  __esModule: true,
  default: mockNative,
}));

type Lib = typeof import('../index');

const load = (os: 'ios' | 'android'): Lib => {
  let lib: Lib | undefined;
  jest.isolateModules(() => {
    const { Platform } = require('react-native');
    Platform.OS = os;
    lib = require('../index');
  });
  return lib!;
};

beforeEach(() => {
  Object.values(mockNative).forEach((fn) => fn.mockClear());
});

describe('cross-platform', () => {
  it('canAddPasses defaults to json format', async () => {
    const lib = load('android');
    await lib.canAddPasses();
    await lib.canAddPasses('jwt');
    expect(mockNative.canAddPasses.mock.calls).toEqual([['json'], ['jwt']]);
  });

  it('addPasses forwards the array', async () => {
    const lib = load('ios');
    await lib.addPasses(['a', 'b']);
    expect(mockNative.addPasses).toHaveBeenCalledWith(['a', 'b']);
  });

  it('addPassJWT is a no-op on iOS', async () => {
    const lib = load('ios');
    await lib.addPassJWT('jwt');
    expect(mockNative.addPassJWT).not.toHaveBeenCalled();
  });
});

describe('iOS pass library', () => {
  it('converts relevant dates to Date objects', async () => {
    const lib = load('ios');
    const [pass] = await lib.getPasses();
    expect(pass!.relevantDates[0]!.date).toEqual(new Date(1000));
    expect(pass!.relevantDates[1]!.startDate).toEqual(new Date(2000));
    expect(pass!.relevantDates[1]!.endDate).toEqual(new Date(3000));
    expect(pass!.userInfo).toEqual({ seat: '12A' });
  });

  it('getPass resolves null when missing', async () => {
    const lib = load('ios');
    mockNative.getPass.mockResolvedValueOnce(null as never);
    await expect(lib.getPass('t', 's')).resolves.toBeNull();
  });
});

describe('Android fallbacks', () => {
  it('query methods resolve empty values without calling native', async () => {
    const lib = load('android');
    await expect(lib.getPasses()).resolves.toEqual([]);
    await expect(lib.getPass('t', 's')).resolves.toBeNull();
    await expect(lib.containsPass('p')).resolves.toBe(false);
    await expect(lib.isPassLibraryAvailable()).resolves.toBe(false);
    await expect(lib.getPassFieldValue('t', 's', 'k')).resolves.toBeNull();
    expect(mockNative.getPasses).not.toHaveBeenCalled();
  });

  it('mutations reject with E_UNSUPPORTED_PLATFORM', async () => {
    const lib = load('android');
    await expect(lib.removePass('t', 's')).rejects.toMatchObject({
      code: lib.UNSUPPORTED_PLATFORM,
    });
    await expect(lib.replacePass('p')).rejects.toMatchObject({
      code: 'E_UNSUPPORTED_PLATFORM',
    });
    await expect(lib.openPass('t', 's')).rejects.toMatchObject({
      code: 'E_UNSUPPORTED_PLATFORM',
    });
  });

  it('passLibraryChangedListener returns a no-op unsubscribe', () => {
    const lib = load('android');
    const unsubscribe = lib.passLibraryChangedListener(() => {});
    expect(() => unsubscribe()).not.toThrow();
    expect(mockNative.addListener).not.toHaveBeenCalled();
  });
});

describe('resolveAndroidVariant', () => {
  const { resolveAndroidVariant } = require('../buttonVariant');

  it('defaults to the primary Google Wallet button', () => {
    expect(resolveAndroidVariant(undefined)).toBe('primary');
    expect(resolveAndroidVariant('primary')).toBe('primary');
  });

  it('passes condensed through', () => {
    expect(resolveAndroidVariant('condensed')).toBe('condensed');
  });

  it('maps legacy Google Pay variants to primary and warns once each', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveAndroidVariant('light')).toBe('primary');
    expect(resolveAndroidVariant('light')).toBe('primary');
    expect(resolveAndroidVariant('light-outline')).toBe('primary');
    expect(warn).toHaveBeenCalledTimes(2);
    expect(String(warn.mock.calls[0]![0])).toContain("'light' is deprecated");
    warn.mockRestore();
  });
});
