export default SILENT_LOGGER;
declare const SILENT_LOGGER: Readonly<{
    level: "silent";
    debug: () => void;
    info: () => void;
    warn: () => void;
    error: () => void;
    fatal: () => void;
    trace: () => void;
    child: () => Readonly</*elided*/ any>;
    isLevelEnabled: () => false;
}>;
