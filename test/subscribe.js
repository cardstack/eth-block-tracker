const GanacheCore = require('ganache-core');
const pify = require('pify');

module.exports = (test, testLabel, SubscribeBlockTracker) => {
  test(`${testLabel} - latest`, async (t) => {
    const provider = GanacheCore.provider();
    const blockTracker = new SubscribeBlockTracker({
      provider,
    });

    try {
      t.equal(
        blockTracker.isRunning(),
        false,
        'SubscribeBlockTracker should begin stopped',
      );

      const blocks = [];
      blockTracker.on('latest', (block) => blocks.push(block));
      t.equal(
        blockTracker.isRunning(),
        true,
        'SubscribeBlockTracker should start after listener is added',
      );
      t.equal(blocks.length, 0, 'no blocks so far');

      await newLatestBlock(blockTracker);
      t.equal(blocks.length, 1, 'saw 1st block');

      const latestBlock = newLatestBlock(blockTracker);
      await triggerNextBlock(provider);
      await latestBlock;
      t.equal(blocks.length, 2, 'saw 2nd block');

      await triggerNextBlock(provider);
      await triggerNextBlock(provider);
      const lastBlockPromise = newLatestBlock(blockTracker);
      await triggerNextBlock(provider);
      const lastBlock = await lastBlockPromise;
      t.equal(blocks.length, 5, 'saw all intermediate blocks');
      t.equal(
        Number.parseInt(lastBlock, 16),
        4,
        'saw correct block, with number 4',
      );

      blockTracker.removeAllListeners();
      t.equal(
        blockTracker.isRunning(),
        false,
        'SubscribeBlockTracker stops after all listeners are removed',
      );
    } catch (err) {
      t.ifError(err);
    }

    // cleanup
    blockTracker.removeAllListeners();
    t.end();
  });
};

/**
 * Calls the `evm_mine` RPC method via the given provider.
 *
 * @param {any} provider - The provider.
 * @returns {Promise<any>} A promise that resolves to the result of the `evm_mine` call.
 */
async function triggerNextBlock(provider) {
  await pify((cb) =>
    provider.sendAsync(
      { id: 1, method: 'evm_mine', jsonrpc: '2.0', params: [] },
      cb,
    ),
  )();
}

/**
 * Fetches the latest block via the given block tracker.
 *
 * @param {BaseBlockTracker} blockTracker - The block tracker.
 * @returns {Promise<Block>} The promise for the block.
 */
async function newLatestBlock(blockTracker) {
  return await pify(blockTracker.once, { errorFirst: false }).call(
    blockTracker,
    'latest',
  );
}
