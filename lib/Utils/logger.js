const SILENT_LOGGER = Object.freeze({
    level: 'silent',
    debug: () => { },
    info: () => { },
    warn: () => { },
    error: () => { },
    fatal: () => { },
    trace: () => { },
    child: () => SILENT_LOGGER,
    isLevelEnabled: () => false
});
export default SILENT_LOGGER;
