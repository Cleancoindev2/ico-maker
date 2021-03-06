const { expectRevert } = require('@openzeppelin/test-helpers');

function shouldBehaveLikeCappedCrowdsale ([investor]) {
  let cap;
  let lessThanCap;

  beforeEach(async function () {
    cap = await this.crowdsale.cap();
    lessThanCap = cap.divn(2);
  });

  describe('accepting payments', function () {
    it('should accept payments within cap', async function () {
      await this.crowdsale.send(cap.sub(lessThanCap), { from: investor });
      await this.crowdsale.send(lessThanCap, { from: investor });
    });

    it('should reject payments outside cap', async function () {
      await this.crowdsale.send(cap, { from: investor });
      await expectRevert.unspecified(this.crowdsale.send(1, { from: investor }));
    });

    it('should reject payments that exceed cap', async function () {
      await expectRevert.unspecified(this.crowdsale.send(cap.addn(1), { from: investor }));
    });
  });

  describe('ending', function () {
    it('should not reach cap if sent under cap', async function () {
      await this.crowdsale.send(lessThanCap, { from: investor });
      (await this.crowdsale.capReached()).should.equal(false);
    });

    it('should not reach cap if sent just under cap', async function () {
      await this.crowdsale.send(cap.subn(1), { from: investor });
      (await this.crowdsale.capReached()).should.equal(false);
    });

    it('should reach cap if cap sent', async function () {
      await this.crowdsale.send(cap, { from: investor });
      (await this.crowdsale.capReached()).should.equal(true);
    });
  });
}

module.exports = {
  shouldBehaveLikeCappedCrowdsale,
};
