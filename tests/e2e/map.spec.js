describe("Map editor", () => {
  beforeEach(() => {
    cy.visit("/app");
  });

  it("loads the map", () => {
    cy.get("#map canvas.loaded");

    cy.window().its("pelica.state").toMatchSnapshot();
    cy.get("body").toMatchImageSnapshot();
  });

  it("allows placing pins", () => {
    cy.get("#map canvas.loaded");

    cy.get("#toolbar-pin").click();
    cy.get("canvas").trigger("click", 100, 100);
    cy.get("canvas").trigger("click", 100, 200);

    cy.window().its("pelica.state").toMatchSnapshot();
    cy.get("body").toMatchImageSnapshot();
  });

  it("allows drawing routes", () => {
    cy.get("#map canvas.loaded");

    cy.get("#toolbar-draw").click();
    cy.get("canvas").trigger("mousedown", 300, 300).trigger("mouseup");
    cy.get("canvas").trigger("mousedown", 300, 400).trigger("mouseup");
    cy.get("canvas").trigger("mousedown", 400, 400).trigger("mouseup");
    cy.get("canvas").trigger("mousedown", 400, 500).trigger("mouseup");
    cy.contains("right here").click();

    cy.window().its("pelica.state").toMatchSnapshot();
    cy.get("body").toMatchImageSnapshot();
  });
});
