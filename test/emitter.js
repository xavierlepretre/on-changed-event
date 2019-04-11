const Emitter = artifacts.require("Emitter");
require("./evmFunctions.js")(web3);

contract('Emitter', function(accounts) {

    let emitter;

    before("confirm it is Ganache CLI v6.4.1 (ganache-core: 2.5.3)", async function() {
        assert.strictEqual(
            await web3.eth.getNodeInfo(),
            "EthereumJS TestRPC/v2.5.3/ethereum-js");
    });

    beforeEach("create new Emitter", async function() {
        emitter = await Emitter.new({ from: accounts[0] });
    });

    it("should emit an event", async function() {
        const result = await Promise.all([
            new Promise((resolve, reject) => {
                emitter.contract.events.LogNumber()
                    .on("data", resolve)
                    .on("changed", val => reject("Did not expect " + val))
                    .on("error", reject);
            }),
            emitter.pleaseEmit(13, { from: accounts[0] })
        ]);
        assert.strictEqual(result[0].returnValues.value, "13");
    });

    it("should emit a changed event", async function() {
        this.timeout(5000);
        const snapshotId = await web3.evm.snapshot();
        const result = await Promise.all([
            new Promise((resolve, reject) => {
                const receivedData = [];
                emitter.contract.events.LogNumber()
                    .on("data", event => receivedData.push(event))
                    .on("changed", event => {
                        if (receivedData.length == 1) resolve(event);
                        else reject("Too soon or too late" + event);
                    })
                    .on("error", reject);
            }),
            emitter.pleaseEmit(13, { from: accounts[0] })
                .then(() => web3.evm.revert(snapshotId))
        ]);
        assert.strictEqual(result[0].returnValues.value, "13");
    });

});
