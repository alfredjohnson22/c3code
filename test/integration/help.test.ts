import { runCodeServerCommand } from "../utils/runCodeServerCommand"

// NOTE@jsjoeio
// We have this test to ensure that native modules
// work as expected. If this is called on the wrong
// platform, the test will fail.
describe("--help", () => {
  it("should list c3code usage", async () => {
    const expectedOutput = "Usage: c3code [options] [path]"
    const { stdout } = await runCodeServerCommand(["--help"])
    expect(stdout).toMatch(expectedOutput)
  }, 20000)
})
