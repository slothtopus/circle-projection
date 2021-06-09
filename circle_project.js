let mouse_x;
let mouse_y;

const xDim = 1000;
const yDim = 1000;
const circleRadius = 140;

let selectPointAngle = Math.PI / 2;

let scaleFactor;

function updateAngle(newAngle) {
  const circlePoint = document.getElementById("circlePoint");
  const moveVectorLine = document.getElementById("moveVectorLine");

  const newX = xDim / 2 + Math.cos(newAngle) * circleRadius;
  circlePoint.setAttribute("cx", newX);
  moveVectorLine.setAttribute("x1", newX);

  const newY = yDim / 2 - Math.sin(newAngle) * circleRadius;
  circlePoint.setAttribute("cy", newY);
  moveVectorLine.setAttribute("y1", newY);

  selectPointAngle = newAngle;
}

function updateProjection(startAngle, moveVector) {
  const endAngle = projectOnCircle(circleRadius, startAngle, moveVector);
  const projectionCircle = document.getElementById("projectionCircle");

  if (endAngle > startAngle) {
    if (endAngle - startAngle < Math.PI) {
      const arcLength = Math.max((endAngle - startAngle) * circleRadius, 1);
      projectionCircle.setAttribute(
        "stroke-dasharray",
        `${arcLength} ${2 * Math.PI * circleRadius - arcLength}`
      );
      projectionCircle.setAttribute(
        "stroke-dashoffset",
        `${startAngle * circleRadius + arcLength}`
      );
    } else {
      const arcLength = Math.max(
        (2 * Math.PI + startAngle - endAngle) * circleRadius,
        1
      );
      projectionCircle.setAttribute(
        "stroke-dasharray",
        `${arcLength} ${2 * Math.PI * circleRadius - arcLength}`
      );
      projectionCircle.setAttribute(
        "stroke-dashoffset",
        `${endAngle * circleRadius + arcLength}`
      );
    }
  } else if (startAngle >= endAngle) {
    if (startAngle - endAngle < Math.PI) {
      const arcLength = Math.max((startAngle - endAngle) * circleRadius, 1);
      projectionCircle.setAttribute(
        "stroke-dasharray",
        `${arcLength} ${2 * Math.PI * circleRadius - arcLength}`
      );
      projectionCircle.setAttribute(
        "stroke-dashoffset",
        `${endAngle * circleRadius + arcLength}`
      );
    } else {
      const arcLength = Math.max(
        (2 * Math.PI - startAngle + endAngle) * circleRadius,
        1
      );
      projectionCircle.setAttribute(
        "stroke-dasharray",
        `${arcLength} ${2 * Math.PI * circleRadius - arcLength}`
      );
      projectionCircle.setAttribute(
        "stroke-dashoffset",
        `${startAngle * circleRadius + arcLength}`
      );
    }
  }
}

function getRedMoveVector() {
  const moveVectorLine = document.getElementById("moveVectorLine");
  return [
    moveVectorLine.getAttribute("x2") - moveVectorLine.getAttribute("x1"),
    moveVectorLine.getAttribute("y1") - moveVectorLine.getAttribute("y2"),
  ];
}

function projectOnCircle(radius, angle, moveVector) {
  const i = Math.ceil(Math.sqrt(dotProduct(moveVector, moveVector))) * 3;
  const step = [moveVector[0] / i, moveVector[1] / i];

  for (let j = 0; j < i; j++) {
    const tangentVec = [1, -(Math.cos(angle) / Math.sin(angle))];
    const projectedStepScalar =
      dotProduct(step, tangentVec) / dotProduct(tangentVec, tangentVec);
    const projectedStep = [
      tangentVec[0] * projectedStepScalar,
      tangentVec[1] * projectedStepScalar,
    ];
    const newPos = [
      radius * Math.cos(angle) + projectedStep[0],
      radius * Math.sin(angle) + projectedStep[1],
    ];
    angle = Math.atan2(newPos[1], newPos[0]);
  }
  return angle;
}

function dotProduct(x, y) {
  return x[0] * y[0] + x[1] * y[1];
}

function mousedownHandler(mousemoveHandler, event) {
  mouse_x = event.clientX;
  mouse_y = event.clientY;

  const el = event.target;
  el.classList.add("selected");
  document.body.style.cursor = "pointer";

  function mouseupHandler(event) {
    el.classList.remove("selected");
    document.body.style.cursor = null;
    document.removeEventListener("mousemove", mousemoveHandler);
    document.removeEventListener("mouseup", mouseupHandler);
  }

  document.addEventListener("mousemove", mousemoveHandler);
  document.addEventListener("mouseup", mouseupHandler);
}

function moveVectorMousemove(event) {
  const moveVectorPoint = document.getElementById("moveVectorPoint");
  const moveVectorLine = document.getElementById("moveVectorLine");
  const moveVector = [
    (event.clientX - mouse_x) * scaleFactor,
    (event.clientY - mouse_y) * scaleFactor,
  ];

  const newX = +moveVectorPoint.getAttribute("cx") + moveVector[0];
  const newY = +moveVectorPoint.getAttribute("cy") + moveVector[1];

  moveVectorPoint.setAttribute("cx", newX);
  moveVectorPoint.setAttribute("cy", newY);
  moveVectorLine.setAttribute("x2", newX);
  moveVectorLine.setAttribute("y2", newY);

  const redMoveVector = getRedMoveVector();
  updateProjection(selectPointAngle, redMoveVector);

  mouse_x = event.clientX;
  mouse_y = event.clientY;
}

function circlePointMousemove(event) {
  // [increases to right, increases to top]
  const moveVector = [
    (event.clientX - mouse_x) * scaleFactor,
    (mouse_y - event.clientY) * scaleFactor,
  ];

  updateAngle(projectOnCircle(circleRadius, selectPointAngle, moveVector));
  const redMoveVector = getRedMoveVector();
  updateProjection(selectPointAngle, redMoveVector);

  mouse_x = event.clientX;
  mouse_y = event.clientY;
}

function onResize() {
  const svgRect = document.querySelector("svg").getBoundingClientRect();
  scaleFactor = 1000 / Math.min(svgRect.width, svgRect.height);
}

window.onload = () => {
  onResize();
  window.onResize = onResize;
  window.addEventListener("resize", onResize);
  document
    .getElementById("circlePoint")
    .addEventListener(
      "mousedown",
      mousedownHandler.bind(this, circlePointMousemove)
    );
  document
    .getElementById("moveVectorPoint")
    .addEventListener(
      "mousedown",
      mousedownHandler.bind(this, moveVectorMousemove)
    );

  updateAngle(projectOnCircle(circleRadius, selectPointAngle, [0, 0]));
  const redMoveVector = getRedMoveVector();
  updateProjection(selectPointAngle, redMoveVector);
};
