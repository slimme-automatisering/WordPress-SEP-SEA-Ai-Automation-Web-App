export default {
    testEnvironment: 'node',
    transform: {},
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons']
    }
};
