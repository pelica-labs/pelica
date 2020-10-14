describe("Map editor", () => {
  beforeEach(() => {
    cy.visit("/app");
  });

  it("loads the map", () => {
    cy.get("#map canvas.loaded");

    cy.wait(1000).get("#map canvas").toMatchImageSnapshot();
  });

  it("allows placing pins", () => {
    cy.get("#map canvas.loaded");

    cy.get("#toolbar-pin").click();
    cy.get("canvas").trigger("click", 100, 100);
    cy.get("canvas").trigger("click", 100, 200);

    cy.wait(1000).get("#map canvas").toMatchImageSnapshot();
  });

  it("allows drawing routes", () => {
    cy.get("#map canvas.loaded");

    cy.get("#toolbar-draw").click();
    cy.get("canvas").trigger("mousedown", 300, 300).trigger("mouseup");
    cy.get("canvas").trigger("mousedown", 300, 400).trigger("mouseup");
    cy.get("canvas").trigger("mousedown", 400, 400).trigger("mouseup");
    cy.get("canvas").trigger("mousedown", 400, 500).trigger("mouseup");
    cy.contains("right here").click();

    cy.wait(1000).get("#map canvas").toMatchImageSnapshot();
  });
});
