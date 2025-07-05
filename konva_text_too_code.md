Konva official docs link : https://konvajs.org/docs/index.html

Import { Stage, Layer, Text, Rect } from 'react-konva';

const text = `COMPLEX TEXT

All the world's a stage, and all the men and women merely players. They have their exits and their entrances.`;
const App = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text
          x={window.innerWidth / 2}
          y={15}
          text="Simple Text"
          fontSize={30}
          fontFamily="Calibri"
          fill="green"
          offsetX={60} // Approximate half width
        />
        <Rect
          x={20}
          y={60}
          stroke="#555"
          strokeWidth={5}
          fill="#ddd"
          width={300}
          height={200} // Approximate height
          shadowColor="black"
          shadowBlur={10}
          shadowOffsetX={10}
          shadowOffsetY={10}
          shadowOpacity={0.2}
          cornerRadius={10}
        />
        <Text
          x={20}
          y={60}
          text={text}
          fontSize={18}
          fontFamily="Calibri"
          fill="#555"
          width={300}
          padding={20}
          align="center"
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, TextPath } from 'react-konva';

const App = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <TextPath
          x={0}
          y={50}
          fill="#333"
          fontSize={16}
          fontFamily="Arial"
          text="All the world's a stage, and all the men and women merely players."
          data="M10,10 C0,0 10,150 100,100 S300,150 400,50"
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Group, Circle, Rect } from 'react-konva';

const App = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Group x={50} y={50} draggable>
          <Circle x={0} y={0} radius={30} fill="red" />
          <Rect x={20} y={20} width={100} height={50} fill="green" />
        </Group>
      </Layer>
    </Stage>
  );
};

export default App;

import React from 'react';
import { Stage, Layer, RegularPolygon } from 'react-konva';
import useImage from 'use-image';

const commonProps = {
  sides: 5,
  radius: 70,
  stroke: 'black',
  strokeWidth: 4,
  draggable: true,
};

const ColorPolygon = () => {
  const [fill, setFill] = React.useState('red');
  return (
    <RegularPolygon
      {...commonProps}
      x={80}
      y={window.innerHeight / 2}
      fill={fill}
      onMouseEnter={(e) => {
        setFill('blue');
        e.target.getStage().container().style.cursor = 'pointer';
      }}
      onMouseLeave={(e) => {
        setFill('red');
        e.target.getStage().container().style.cursor = 'default';
      }}
    />
  );
};

const PatternPolygon = () => {
  const [darthVader] = useImage('https://konvajs.org/assets/darth-vader.jpg');
  const [yoda] = useImage('https://konvajs.org/assets/yoda.jpg');
  const [image, setImage] = React.useState(null);
  const [offset, setOffset] = React.useState({ x: -220, y: 70 });

  React.useEffect(() => {
    if (darthVader) {
      setImage(darthVader);
    }
  }, [darthVader]);

  return (
    <RegularPolygon
      {...commonProps}
      x={220}
      y={window.innerHeight / 2}
      fillPatternImage={image}
      fillPatternOffset={offset}
      onMouseEnter={(e) => {
        setImage(yoda);
        setOffset({ x: -100, y: 70 });
        e.target.getStage().container().style.cursor = 'pointer';
      }}
      onMouseLeave={(e) => {
        setImage(darthVader);
        setOffset({ x: -220, y: 70 });
        e.target.getStage().container().style.cursor = 'default';
      }}
    />
  );
};

const LinearGradientPolygon = () => {
  const [colorStops, setColorStops] = React.useState([0, 'red', 1, 'yellow']);
  return (
    <RegularPolygon
      {...commonProps}
      x={360}
      y={window.innerHeight / 2}
      fillLinearGradientStartPoint={{ x: -50, y: -50 }}
      fillLinearGradientEndPoint={{ x: 50, y: 50 }}
      fillLinearGradientColorStops={colorStops}
      onMouseEnter={(e) => {
        setColorStops([0, 'green', 1, 'yellow']);
        e.target.getStage().container().style.cursor = 'pointer';
      }}
      onMouseLeave={(e) => {
        setColorStops([0, 'red', 1, 'yellow']);
        e.target.getStage().container().style.cursor = 'default';
      }}
    />
  );
};

const RadialGradientPolygon = () => {
  const [colorStops, setColorStops] = React.useState([0, 'red', 0.5, 'yellow', 1, 'blue']);
  return (
    <RegularPolygon
      {...commonProps}
      x={500}
      y={window.innerHeight / 2}
      fillRadialGradientStartPoint={{ x: 0, y: 0 }}
      fillRadialGradientStartRadius={0}
      fillRadialGradientEndPoint={{ x: 0, y: 0 }}
      fillRadialGradientEndRadius={70}
      fillRadialGradientColorStops={colorStops}
      onMouseEnter={(e) => {
        setColorStops([0, 'red', 0.5, 'yellow', 1, 'green']);
        e.target.getStage().container().style.cursor = 'pointer';
      }}
      onMouseLeave={(e) => {
        setColorStops([0, 'red', 0.5, 'yellow', 1, 'blue']);
        e.target.getStage().container().style.cursor = 'default';
      }}
    />
  );
};

const App = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <ColorPolygon />
        <PatternPolygon />
        <LinearGradientPolygon />
        <RadialGradientPolygon />
      </Layer>
    </Stage>
  );
};

export default App;

import React, { useState } from 'react';
import { Stage, Layer, RegularPolygon } from 'react-konva';

const App = () => {
  const [stroke, setStroke] = useState('black');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [cursor, setCursor] = useState('default');

  const handleMouseEnter = () => {
    setStroke('blue');
    setStrokeWidth(20);
    setCursor('pointer');
  };

  const handleMouseLeave = () => {
    setStroke('black');
    setStrokeWidth(4);
    setCursor('default');
  };

  return (
    <Stage width={window.innerWidth} height={window.innerHeight} style={{ cursor: cursor }}>
      <Layer>
        <RegularPolygon
          x={window.innerWidth / 2}
          y={window.innerHeight / 2}
          sides={5}
          radius={70}
          fill="red"
          stroke={stroke}
          strokeWidth={strokeWidth}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import React, { useState } from 'react';
import { Stage, Layer, RegularPolygon } from 'react-konva';

const App = () => {
  const [opacity, setOpacity] = useState(0.5);
  const [cursor, setCursor] = useState('default');

  const handleMouseEnter = () => {
    setOpacity(1);
    setCursor('pointer');
  };

  const handleMouseLeave = () => {
    setOpacity(0.5);
    setCursor('default');
  };

  return (
    <Stage width={window.innerWidth} height={window.innerHeight} style={{ cursor: cursor }}>
      <Layer>
        <RegularPolygon
          x={window.innerWidth / 2}
          y={window.innerHeight / 2}
          sides={5}
          radius={70}
          fill="red"
          stroke="black"
          strokeWidth={4}
          opacity={opacity}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import React from 'react';
import { Stage, Layer, Text, Line, Rect } from 'react-konva';

const App = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text
          text="Text Shadow!"
          fontFamily="Calibri"
          fontSize={40}
          x={20}
          y={20}
          stroke="red"
          strokeWidth={2}
          shadowColor="black"
          shadowBlur={0}
          shadowOffset={{ x: 10, y: 10 }}
          shadowOpacity={0.5}
        />
        <Line
          stroke="green"
          strokeWidth={10}
          lineJoin="round"
          lineCap="round"
          points={[50, 140, 250, 160]}
          shadowColor="black"
          shadowBlur={10}
          shadowOffset={{ x: 10, y: 10 }}
          shadowOpacity={0.5}
        />
        <Rect
          x={100}
          y={120}
          width={100}
          height={50}
          fill="#00D2FF"
          stroke="black"
          strokeWidth={4}
          shadowColor="black"
          shadowBlur={10}
          shadowOffset={{ x: 10, y: 10 }}
          shadowOpacity={0.5}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, RegularPolygon } from 'react-konva';
import { useState } from 'react';

const App = () => {
  const [lineJoin, setLineJoin] = useState('miter');

  const handleMouseEnter = () => {
    const lineJoins = ['miter', 'bevel', 'round'];
    const index = lineJoins.indexOf(lineJoin);
    const nextIndex = (index + 1) % lineJoins.length;
    setLineJoin(lineJoins[nextIndex]);
  };

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <RegularPolygon
          x={window.innerWidth / 2}
          y={window.innerHeight / 2}
          sides={3}
          radius={70}
          fill="#00D2FF"
          stroke="black"
          strokeWidth={20}
          lineJoin={lineJoin}
          onMouseEnter={handleMouseEnter}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import React, { useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

function App() {
  const [visible, setVisible] = useState(true);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', zIndex: 1, padding: '10px' }}>
        <button onClick={() => setVisible(true)}>Show</button>
        <button onClick={() => setVisible(false)}>Hide</button>
      </div>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Rect
            x={window.innerWidth / 2 - 50}
            y={window.innerHeight / 2 - 25}
            width={100}
            height={50}
            fill="green"
            stroke="black"
            strokeWidth={4}
            visible={visible}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default App;

import { Stage, Layer, RegularPolygon } from 'react-konva';
import { useState } from 'react';

// Separate component for polygon that changes cursor directly
const SpecialPolygon = ({ x, y }) => {
  // We use e.target approach here because this component doesn't have
  // access to the Stage's cursor state from the parent component
  const handleMouseOver = (e) => {
    e.target.getStage().container().style.cursor = 'pointer';
  };

  const handleMouseOut = (e) => {
    e.target.getStage().container().style.cursor = 'default';
  };

  return (
    <RegularPolygon
      x={x}
      y={y}
      sides={5}
      radius={30}
      fill="red"
      stroke="black"
      strokeWidth={4}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    />
  );
};

const App = () => {
  const [cursor, setCursor] = useState('default');

  return (
    <Stage 
      width={window.innerWidth} 
      height={window.innerHeight}
      style={{ cursor }}
    >
      <Layer>
        <SpecialPolygon
          x={80}
          y={window.innerHeight / 2}
        />
        <RegularPolygon
          x={180}
          y={window.innerHeight / 2}
          sides={5}
          radius={30}
          fill="green"
          stroke="black"
          strokeWidth={4}
          onMouseOver={() => setCursor('crosshair')}
          onMouseOut={() => setCursor('default')}
        />
        <RegularPolygon
          x={280}
          y={window.innerHeight / 2}
          sides={5}
          radius={30}
          fill="blue"
          stroke="black"
          strokeWidth={4}
          onMouseOver={() => setCursor('move')}
          onMouseOut={() => setCursor('default')}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Text, Rect } from 'react-konva';

const App = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text
          text="Text Shadow!"
          fontFamily="Calibri"
          fontSize={40}
          x={20}
          y={20}
          fill="green"
          shadowColor="white"
          shadowOffset={{ x: 10, y: 10 }}
        />
        <Rect
          x={50}
          y={50}
          width={100}
          height={100}
          fill="red"
          draggable={true}
          globalCompositeOperation="xor"
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Text } from 'react-konva';

const App = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text
          text="Default shape rendering.\nfillAfterStrokeEnabled = false"
          x={50}
          y={50}
          fontSize={40}
          stroke="green"
          fill="yellow"
          strokeWidth={3}
        />
        <Text
          text="Reversed rendering order.\nfillAfterStrokeEnabled = true"
          x={50}
          y={150}
          fontSize={40}
          stroke="green"
          fill="yellow"
          strokeWidth={3}
          fillAfterStrokeEnabled={true}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, RegularPolygon, Circle, Text } from 'react-konva';
import { useState, useRef } from 'react';

const App = () => {
  const [message, setMessage] = useState('');
  const stageRef = useRef();

  const handleTriangleTouch = () => {
    const touchPos = stageRef.current.getPointerPosition();
    setMessage(`x: ${touchPos.x}, y: ${touchPos.y}`);
  };

  return (
    <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
      <Layer>
        <Text
          x={10}
          y={10}
          fontFamily="Calibri"
          fontSize={24}
          text={message}
          fill="black"
        />
        <RegularPolygon
          x={80}
          y={120}
          sides={3}
          radius={80}
          fill="#00D2FF"
          stroke="black"
          strokeWidth={4}
          onTouchmove={handleTriangleTouch}
        />
        <Circle
          x={230}
          y={100}
          radius={60}
          fill="red"
          stroke="black"
          strokeWidth={4}
          onTouchstart={() => setMessage('touchstart circle')}
          onTouchend={() => setMessage('touchend circle')}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Rect } from 'react-konva';

const App = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect
          x={50}
          y={50}
          width={100}
          height={600}
          fill="green"
          stroke="black"
          strokeWidth={4}
        />
        <Rect
          x={200}
          y={50}
          width={100}
          height={600}
          fill="red"
          stroke="black"
          strokeWidth={4}
          preventDefault={false}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Circle } from 'react-konva';
import { useRef, useEffect, useState } from 'react';

const App = () => {
  const stageRef = useRef();
  const containerRef = useRef();
  const [position, setPosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  useEffect(() => {
    // focus the div on mount
    containerRef.current.focus();
  }, []);

  const handleKeyDown = (e) => {
    const DELTA = 4;
    switch (e.keyCode) {
      case 37: // left
        setPosition(pos => ({ ...pos, x: pos.x - DELTA }));
        break;
      case 38: // up
        setPosition(pos => ({ ...pos, y: pos.y - DELTA }));
        break;
      case 39: // right
        setPosition(pos => ({ ...pos, x: pos.x + DELTA }));
        break;
      case 40: // down
        setPosition(pos => ({ ...pos, y: pos.y + DELTA }));
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
      >
        <Layer>
          <Circle
            x={position.x}
            y={position.y}
            radius={50}
            fill="red"
            stroke="black"
            strokeWidth={4}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default App;

import { Stage, Layer, Circle } from 'react-konva';
import { useState } from 'react';

const App = () => {
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Circle
          x={position.x}
          y={position.y}
          radius={70}
          fill="red"
          stroke="black"
          strokeWidth={4}
          draggable
          onMouseEnter={(e) => {
            document.body.style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            document.body.style.cursor = 'default';
          }}
          onDragEnd={(e) => {
            setPosition({
              x: e.target.x(),
              y: e.target.y()
            });
          }}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import Konva from 'konva';

const stage = new Konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

const group = new Konva.Group({
  draggable: true,
});
layer.add(group);

const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

for (let i = 0; i < 6; i++) {
  const box = new Konva.Rect({
    x: i * 30 + 10,
    y: i * 18 + 40,
    width: 100,
    height: 50,
    name: colors[i],
    fill: colors[i],
    stroke: 'black',
    strokeWidth: 4,
  });
  group.add(box);
}

group.on('mouseover', function () {
  document.body.style.cursor = 'move';
});
group.on('mouseout', function () {
  document.body.style.cursor = 'default';
});

import { Stage, Layer, Line } from 'react-konva';
import { useState } from 'react';

const App = () => {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Line
          x={position.x}
          y={position.y}
          points={[0, 0, 150, 0]}
          stroke="red"
          strokeWidth={15}
          lineCap="round"
          lineJoin="round"
          draggable
          onDragEnd={(e) => {
            setPosition({
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          onMouseEnter={(e) => {
            document.body.style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            document.body.style.cursor = 'default';
          }}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Circle, Text } from 'react-konva';

const App = () => {
  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      draggable
    >
      <Layer>
        <Circle
          x={window.innerWidth / 2}
          y={window.innerHeight / 2}
          radius={70}
          fill="red"
          stroke="black"
          strokeWidth={4}
        />
        <Text
          x={10}
          y={10}
          text="Drag the stage anywhere"
          fontSize={20}
          fontFamily="Calibri"
          fill="black"
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Text } from 'react-konva';
import { useState } from 'react';

const App = () => {
  const [status, setStatus] = useState('');

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text
          x={40}
          y={40}
          text="Draggable Text"
          fontSize={20}
          draggable
          width={200}
          onDragStart={() => setStatus('drag started')}
          onDragEnd={() => setStatus('drag ended')}
          onDragMove={() => setStatus('dragging')}
        />
        <Text
          x={40}
          y={100}
          text={status}
          fontSize={16}
          width={200}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Group, Rect, Text } from 'react-konva';

const App = () => {
  const handleBlueDragMove = (e) => {
    e.target.y(Math.max(e.target.y(), 50));
  };

  const handleYellowDragMove = (e) => {
    const x = window.innerWidth / 2;
    const y = 70;
    const radius = 50;
    const pos = e.target.absolutePosition();
    const scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));

    if (scale < 1) {
      e.target.x(Math.round((pos.x - x) * scale + x));
      e.target.y(Math.round((pos.y - y) * scale + y));
    }
  };

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Group x={30} y={70} draggable onDragMove={handleBlueDragMove}>
          <Rect
            width={150}
            height={72}
            fill="#aaf"
            stroke="black"
            strokeWidth={4}
          />
          <Text
            text="bound below"
            fontSize={26}
            fontFamily="Calibri"
            fill="black"
            padding={10}
            width={150}
            align="center"
          />
        </Group>
        <Group
          x={window.innerWidth / 2}
          y={70}
          draggable
          onDragMove={handleYellowDragMove}
        >
          <Rect
            width={150}
            height={72}
            fill="yellow"
            stroke="black"
            strokeWidth={4}
          />
          <Text
            text="bound in circle"
            fontSize={26}
            fontFamily="Calibri"
            fill="black"
            padding={10}
            width={150}
            align="center"
          />
        </Group>
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Text, Star } from 'react-konva';
import { useState, useRef } from 'react';

const App = () => {
  const [stars] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: window.innerWidth * Math.random(),
      y: window.innerHeight * Math.random(),
      fill: 'blue',
      name: `star ${i}`,
    }))
  );
  const [message, setMessage] = useState('');
  const previousShapeRef = useRef(null);
  const mainLayerRef = useRef(null);
  const tempLayerRef = useRef(null);

  const handleDragStart = (e) => {
    const shape = e.target;
    shape.moveTo(tempLayerRef.current);
    setMessage('Moving ' + shape.name());
  };

  const handleDragMove = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const shape = mainLayerRef.current.getIntersection(pos);

    if (previousShapeRef.current && shape) {
      if (previousShapeRef.current !== shape) {
        // leave from old target
        previousShapeRef.current.fire('dragleave', { evt: e.evt }, true);
        // enter new target
        shape.fire('dragenter', { evt: e.evt }, true);
        previousShapeRef.current = shape;
      } else {
        previousShapeRef.current.fire('dragover', { evt: e.evt }, true);
      }
    } else if (!previousShapeRef.current && shape) {
      previousShapeRef.current = shape;
      shape.fire('dragenter', { evt: e.evt }, true);
    } else if (previousShapeRef.current && !shape) {
      previousShapeRef.current.fire('dragleave', { evt: e.evt }, true);
      previousShapeRef.current = undefined;
    }
  };

  const handleDragEnd = (e) => {
    const shape = e.target;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const dropShape = mainLayerRef.current.getIntersection(pos);
    
    if (dropShape) {
      previousShapeRef.current.fire('drop', { evt: e.evt }, true);
    }
    
    shape.moveTo(mainLayerRef.current);
    previousShapeRef.current = undefined;
  };

  const handleDragEnter = (e) => {
    e.target.fill('green');
    setMessage('dragenter ' + e.target.name());
  };

  const handleDragLeave = (e) => {
    e.target.fill('blue');
    setMessage('dragleave ' + e.target.name());
  };

  const handleDragOver = (e) => {
    setMessage('dragover ' + e.target.name());
  };

  const handleDrop = (e) => {
    e.target.fill('red');
    setMessage('drop ' + e.target.name());
  };

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer ref={mainLayerRef}>
        <Text text={message} fill="black" />
        {stars.map((star) => (
          <Star
            key={star.id}
            id={star.id}
            name={star.name}
            x={star.x}
            y={star.y}
            numPoints={10}
            innerRadius={20}
            outerRadius={25}
            fill={star.fill}
            shadowOffsetX={5}
            shadowOffsetY={5}
            draggable
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </Layer>
      <Layer ref={tempLayerRef} />
    </Stage>
  );
};

export default App;

import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useState, useEffect, useRef } from 'react';

const initialRectangles = [
  {
    x: 60,
    y: 60,
    width: 100,
    height: 90,
    fill: 'red',
    id: 'rect1',
    name: 'rect',
    rotation: 0,
  },
  {
    x: 250,
    y: 100,
    width: 150,
    height: 90,
    fill: 'green',
    id: 'rect2',
    name: 'rect',
    rotation: 0,
  },
];

// Helper functions for calculating bounding boxes of rotated rectangles
const degToRad = (angle) => (angle / 180) * Math.PI;

const getCorner = (pivotX, pivotY, diffX, diffY, angle) => {
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);
  angle += Math.atan2(diffY, diffX);
  const x = pivotX + distance * Math.cos(angle);
  const y = pivotY + distance * Math.sin(angle);
  return { x, y };
};

const getClientRect = (element) => {
  const { x, y, width, height, rotation = 0 } = element;
  const rad = degToRad(rotation);

  const p1 = getCorner(x, y, 0, 0, rad);
  const p2 = getCorner(x, y, width, 0, rad);
  const p3 = getCorner(x, y, width, height, rad);
  const p4 = getCorner(x, y, 0, height, rad);

  const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
  const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const App = () => {
  const [rectangles, setRectangles] = useState(initialRectangles);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionRectangle, setSelectionRectangle] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });
  
  const isSelecting = useRef(false);
  const transformerRef = useRef();
  const rectRefs = useRef(new Map());
  
  // Update transformer when selection changes
  useEffect(() => {
    if (selectedIds.length && transformerRef.current) {
      // Get the nodes from the refs Map
      const nodes = selectedIds
        .map(id => rectRefs.current.get(id))
        .filter(node => node);
      
      transformerRef.current.nodes(nodes);
    } else if (transformerRef.current) {
      // Clear selection
      transformerRef.current.nodes([]);
    }
  }, [selectedIds]);
  
  // Click handler for stage
  const handleStageClick = (e) => {
    // If we are selecting with rect, do nothing
    if (selectionRectangle.visible) {
      return;
    }

    // If click on empty area - remove all selections
    if (e.target === e.target.getStage()) {
      setSelectedIds([]);
      return;
    }

    // Do nothing if clicked NOT on our rectangles
    if (!e.target.hasName('rect')) {
      return;
    }

    const clickedId = e.target.id();
    
    // Do we pressed shift or ctrl?
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = selectedIds.includes(clickedId);

    if (!metaPressed && !isSelected) {
      // If no key pressed and the node is not selected
      // select just one
      setSelectedIds([clickedId]);
    } else if (metaPressed && isSelected) {
      // If we pressed keys and node was selected
      // we need to remove it from selection
      setSelectedIds(selectedIds.filter(id => id !== clickedId));
    } else if (metaPressed && !isSelected) {
      // Add the node into selection
      setSelectedIds([...selectedIds, clickedId]);
    }
  };
  
  const handleMouseDown = (e) => {
    // Do nothing if we mousedown on any shape
    if (e.target !== e.target.getStage()) {
      return;
    }
    
    // Start selection rectangle
    isSelecting.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setSelectionRectangle({
      visible: true,
      x1: pos.x,
      y1: pos.y,
      x2: pos.x,
      y2: pos.y,
    });
  };

  const handleMouseMove = (e) => {
    // Do nothing if we didn't start selection
    if (!isSelecting.current) {
      return;
    }
    
    const pos = e.target.getStage().getPointerPosition();
    setSelectionRectangle({
      ...selectionRectangle,
      x2: pos.x,
      y2: pos.y,
    });
  };

  const handleMouseUp = () => {
    // Do nothing if we didn't start selection
    if (!isSelecting.current) {
      return;
    }
    isSelecting.current = false;
    
    // Update visibility in timeout, so we can check it in click event
    setTimeout(() => {
      setSelectionRectangle({
        ...selectionRectangle,
        visible: false,
      });
    });

    const selBox = {
      x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
      y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
      width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
      height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
    };

    const selected = rectangles.filter(rect => {
      // Check if rectangle intersects with selection box
      return Konva.Util.haveIntersection(selBox, getClientRect(rect));
    });
    
    setSelectedIds(selected.map(rect => rect.id));
  };

  const handleDragEnd = (e) => {
    const id = e.target.id();
    setRectangles(prevRects => {
      const newRects = [...prevRects];
      const index = newRects.findIndex(r => r.id === id);
      if (index !== -1) {
        newRects[index] = {
          ...newRects[index],
          x: e.target.x(),
          y: e.target.y()
        };
      }
      return newRects;
    });
  };

  const handleTransformEnd = (e) => {
    // Find which rectangle(s) were transformed
    const id = e.target.id();
    const node = e.target;
    
    setRectangles(prevRects => {
      const newRects = [...prevRects];
      
      // Update each transformed node
      const index = newRects.findIndex(r => r.id === id);
      
      if (index !== -1) {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        // Reset scale
        node.scaleX(1);
        node.scaleY(1);
        
        // Update the state with new values
        newRects[index] = {
          ...newRects[index],
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(node.height() * scaleY),
          rotation: node.rotation(),
        };
      }
      
      return newRects;
    });
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      onClick={handleStageClick}
    >
      <Layer>
        {/* Render rectangles directly */}
        {rectangles.map(rect => (
          <Rect
            key={rect.id}
            id={rect.id}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill={rect.fill}
            name={rect.name}
            rotation={rect.rotation}
            draggable
            ref={node => {
              if (node) {
                rectRefs.current.set(rect.id, node);
              }
            }}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
          />
        ))}
        
        {/* Single transformer for all selected shapes */}
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          
        />
        
        {/* Selection rectangle */}
        {selectionRectangle.visible && (
          <Rect
            x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
            y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
            width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
            height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
            fill="rgba(0,0,255,0.5)"
          />
        )}
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useRef, useEffect } from 'react';

const App = () => {
  const rectRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    trRef.current.nodes([rectRef.current]);
  }, []);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect
          x={50}
          y={50}
          width={100}
          height={100}
          fill="yellow"
          stroke="black"
          draggable
          ref={rectRef}
        />
        <Transformer
          ref={trRef}
          borderStroke="#000"
          borderStrokeWidth={3}
          anchorFill="#fff"
          anchorStroke="#000"
          anchorStrokeWidth={2}
          anchorSize={20}
          anchorCornerRadius={50}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useRef, useEffect } from 'react';

const App = () => {
  const rectRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    trRef.current.nodes([rectRef.current]);
  }, []);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect
          x={50}
          y={50}
          width={100}
          height={100}
          fill="yellow"
          stroke="black"
          draggable
          ref={rectRef}
        />
        <Transformer
          ref={trRef}
          anchorStyleFunc={(anchor) => {
            // make all anchors circles
            anchor.cornerRadius(50);
            // make all anchors red
            anchor.fill('red');

            // make right-middle bigger
            if (anchor.hasName('middle-right')) {
              anchor.scale({ x: 2, y: 2 });
            }
            // make top-left invisible
            if (anchor.hasName('top-left')) {
              anchor.scale({ x: 0, y: 0 });
            }
          }}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useRef, useEffect } from 'react';

const App = () => {
  const rectRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    trRef.current.nodes([rectRef.current]);
  }, []);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect
          x={50}
          y={50}
          width={100}
          height={100}
          fill="yellow"
          stroke="black"
          draggable
          ref={rectRef}
          onTransformStart={() => console.log('rect transform start')}
          onTransform={() => console.log('rect transforming')}
          onTransformEnd={() => console.log('rect transform end')}
        />
        <Transformer
          ref={trRef}
          onTransformStart={() => console.log('transform start')}
          onTransform={() => console.log('transforming')}
          onTransformEnd={() => console.log('transform end')}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Text, Transformer } from 'react-konva';
import { useRef, useEffect, useState } from 'react';

const App = () => {
  const [textWidth, setTextWidth] = useState(200);
  const textRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    trRef.current.nodes([textRef.current]);
  }, []);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text
          x={50}
          y={50}
          text="Hello from Konva! Try to resize me."
          fontSize={24}
          draggable
          width={textWidth}
          ref={textRef}
          onTransform={() => {
            const node = textRef.current;
            setTextWidth(node.width() * node.scaleX());
            node.scaleX(1);
          }}
        />
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right']}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Group, Circle } from 'react-konva';

const App = () => {
  const blobs = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 50,
  }));

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Group
          clipFunc={(ctx) => {
            ctx.beginPath();
            ctx.arc(200, 120, 50, 0, Math.PI * 2, false);
            ctx.arc(280, 120, 50, 0, Math.PI * 2, false);
          }}
        >
          {blobs.map((blob, i) => (
            <Circle
              key={i}
              x={blob.x}
              y={blob.y}
              radius={blob.radius}
              fill="green"
              opacity={0.8}
            />
          ))}
        </Group>
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Rect, Group } from 'react-konva';
import { useState } from 'react';

const App = () => {
  const [redBoxGroup, setRedBoxGroup] = useState('yellow');

  return (
    <>
      <button onClick={() => setRedBoxGroup('yellow')}>
        Move to yellow group
      </button>
      <button onClick={() => setRedBoxGroup('blue')}>
        Move to blue group
      </button>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Group x={50} y={50} draggable>
            <Rect
              width={100}
              height={100}
              fill="yellow"
              stroke="black"
              strokeWidth={4}
            />
            {redBoxGroup === 'yellow' && (
              <Rect x={10} y={10} width={30} height={30} fill="red" />
            )}
          </Group>
          <Group x={200} y={50} draggable>
            <Rect
              width={100}
              height={100}
              fill="blue"
              stroke="black"
              strokeWidth={4}
            />
            {redBoxGroup === 'blue' && (
              <Rect x={10} y={10} width={30} height={30} fill="red" />
            )}
          </Group>
        </Layer>
      </Stage>
    </>
  );
};

export default App;

import { Stage, Layer, Group, Circle, Rect } from 'react-konva';

const App = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Group x={50} y={50} draggable>
          <Circle
            x={40}
            y={40}
            radius={30}
            fill="red"
            stroke="black"
            strokeWidth={4}
          />
          <Rect
            x={80}
            y={20}
            width={100}
            height={50}
            fill="green"
            stroke="black"
            strokeWidth={4}
          />
        </Group>
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Rect } from 'react-konva';
import { useState } from 'react';

const App = () => {
  const [yellowOnTop, setYellowOnTop] = useState(false);

  return (
    <>
      <button onClick={() => setYellowOnTop(true)}>
        Move yellow box to top
      </button>
      <button onClick={() => setYellowOnTop(false)}>
        Move yellow box to bottom
      </button>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {!yellowOnTop && (
            <Rect
              x={100}
              y={100}
              width={100}
              height={100}
              fill="red"
              stroke="black"
              strokeWidth={4}
              draggable
            />
          )}
          <Rect
            x={50}
            y={50}
            width={100}
            height={100}
            fill="yellow"
            stroke="black"
            strokeWidth={4}
            draggable
          />
          {yellowOnTop && (
            <Rect
              x={100}
              y={100}
              width={100}
              height={100}
              fill="red"
              stroke="black"
              strokeWidth={4}
              draggable
            />
          )}
        </Layer>
      </Stage>
    </>
  );
};

export default App;

import { Stage, Layer, Group, Rect, Circle } from 'react-konva';
import { useState } from 'react';

const App = () => {
  const [redCircleGroup, setRedCircleGroup] = useState('group1');

  return (
    <>
      <button onClick={() => setRedCircleGroup('group2')}>
        Move red circle to group2
      </button>
      <button onClick={() => setRedCircleGroup('group1')}>
        Move red circle to group1
      </button>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Group>
            <Rect
              x={10}
              y={10}
              width={100}
              height={100}
              fill="black"
            />
            {redCircleGroup === 'group1' && (
              <Circle
                x={80}
                y={80}
                radius={40}
                fill="red"
              />
            )}
          </Group>
          <Group>
            <Rect
              x={50}
              y={50}
              width={100}
              height={100}
              fill="green"
            />
            {redCircleGroup === 'group2' && (
              <Circle
                x={80}
                y={80}
                radius={40}
                fill="red"
              />
            )}
          </Group>
        </Layer>
      </Stage>
    </>
  );
};

export default App;

import { Stage, Layer, Text, Transformer } from 'react-konva';
import { useRef, useEffect, useState } from 'react';

const App = () => {
  const [textWidth, setTextWidth] = useState(200);
  const textRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    trRef.current.nodes([textRef.current]);
  }, []);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text
          x={50}
          y={50}
          text="Hello from Konva! Try to resize me."
          fontSize={24}
          draggable
          width={textWidth}
          ref={textRef}
          onTransform={() => {
            const node = textRef.current;
            setTextWidth(node.width() * node.scaleX());
            node.scaleX(1);
          }}
        />
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right']}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Image } from 'react-konva';
import { useState, useEffect, useRef } from 'react';
import useImage from 'use-image';

const App = () => {
  const [blurRadius, setBlurRadius] = useState(10);
  const [image] = useImage('https://konvajs.org/assets/lion.png', 'anonymous');
  const imageRef = useRef(null);

  useEffect(() => {
    if (image && imageRef.current) {
      imageRef.current.cache();
    }
  }, [image]);

  return (
    <>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Image
            ref={imageRef}
            x={50}
            y={50}
            image={image}
            draggable
            filters={[Konva.Filters.Blur]}
            blurRadius={blurRadius}
          />
        </Layer>
      </Stage>
      <input
        type="range"
        min="0"
        max="40"
        value={blurRadius}
        onChange={(e) => setBlurRadius(parseInt(e.target.value))}
        style={{ position: 'absolute', top: '20px', left: '20px' }}
      />
    </>
  );
};

export default App;

import { Stage, Layer, Image } from 'react-konva';
import { useState, useEffect, useRef } from 'react';
import useImage from 'use-image';

const App = () => {
  const [brightness, setBrightness] = useState(0.3);
  const [image] = useImage('https://konvajs.org/assets/lion.png', 'anonymous');
  const imageRef = useRef(null);

  useEffect(() => {
    if (image && imageRef.current) {
      imageRef.current.cache();
    }
  }, [image]);

  return (
    <>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Image
            ref={imageRef}
            x={50}
            y={50}
            image={image}
            draggable
            filters={[Konva.Filters.Brighten]}
            brightness={brightness}
          />
        </Layer>
      </Stage>
      <input
        type="range"
        min="-1"
        max="1"
        step="0.1"
        value={brightness}
        onChange={(e) => setBrightness(parseFloat(e.target.value))}
        style={{ position: 'absolute', top: '20px', left: '20px' }}
      />
    </>
  );
};

export default App;

import { Stage, Layer, Image } from 'react-konva';
import { useState, useEffect, useRef } from 'react';
import useImage from 'use-image';

// create our custom filter
Konva.Filters.RemoveAlpha = function (imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = 255; // set alpha to 1
  }
};

const App = () => {
  const [image] = useImage('https://konvajs.org/assets/lion.png', 'anonymous');
  const imageRef = useRef(null);

  useEffect(() => {
    if (image) {
      imageRef.current.cache();
    }
  }, [image]);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Image
          ref={imageRef}
          x={50}
          y={50}
          image={image}
          draggable
          filters={[Konva.Filters.RemoveAlpha]}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Image } from 'react-konva';
import { useState, useEffect, useRef } from 'react';
import useImage from 'use-image';

const FilterControl = ({ name, min, max, step, filters, setFilters }) => {
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  return (
    <div style={{ marginBottom: '10px' }}>
      <input
        type="checkbox"
        id={name}
        checked={filters[name].active}
        onChange={(e) => {
          setFilters({
            ...filters,
            [name]: { ...filters[name], active: e.target.checked },
          });
        }}
      />
      <label htmlFor={name}> {capitalizedName}: </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={filters[name].value}
        disabled={!filters[name].active}
        onChange={(e) => {
          setFilters({
            ...filters,
            [name]: { ...filters[name], value: parseFloat(e.target.value) },
          });
        }}
        style={{ width: '200px' }}
      />
    </div>
  );
};

const App = () => {
  const [filters, setFilters] = useState({
    blur: { active: false, value: 10 },
    brightness: { active: false, value: 0.3 },
    contrast: { active: false, value: 50 },
  });

  const [image] = useImage('https://konvajs.org/assets/lion.png', 'anonymous');
  const imageRef = useRef(null);

  useEffect(() => {
    if (image && imageRef.current) {
      imageRef.current.cache();
    }
  }, [image]);



  const activeFilters = [];
  if (filters.blur.active) activeFilters.push(Konva.Filters.Blur);
  if (filters.brightness.active) activeFilters.push(Konva.Filters.Brighten);
  if (filters.contrast.active) activeFilters.push(Konva.Filters.Contrast);

  return (
    <>
      
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {image && (
            <Image
              ref={imageRef}
              x={50}
              y={50}
              image={image}
              draggable
              filters={activeFilters}
              blurRadius={filters.blur.value}
              brightness={filters.brightness.value}
              contrast={filters.contrast.value}
            />
          )}
        </Layer>
      </Stage>
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <FilterControl name="blur" min={0} max={40} step={1} filters={filters} setFilters={setFilters} />
        <FilterControl name="brightness" min={-1} max={1} step={0.1} filters={filters} setFilters={setFilters} />
        <FilterControl name="contrast" min={-100} max={100} step={1} filters={filters} setFilters={setFilters} />
      </div>
    </>
  );
};

export default App;

import { Stage, Layer, Circle, Rect } from 'react-konva';
import { useEffect, useRef } from 'react';

const App = () => {
  const layerRef = useRef(null);
  
  useEffect(() => {
    // find all circles by name and animate them
    const circles = layerRef.current.find('.myCircle');
    circles.forEach(circle => {
      circle.to({
        duration: 1,
        rotation: 360,
        easing: Konva.Easings.EaseInOut
      });
    });
  }, []);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer ref={layerRef}>
        <Circle
          x={50}
          y={window.innerHeight / 2}
          radius={30}
          fill="red"
          name="myCircle"
        />
        <Circle
          x={150}
          y={window.innerHeight / 2}
          radius={30}
          fill="green"
          name="myCircle"
        />
        <Rect
          x={250}
          y={window.innerHeight / 2 - 25}
          width={50}
          height={50}
          fill="blue"
          name="myRect"
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Circle, Rect } from 'react-konva';
import { useEffect, useRef } from 'react';

const App = () => {
  const layerRef = useRef(null);
  
  useEffect(() => {
    // find all circles by type and animate them
    const circles = layerRef.current.find('Circle');
    circles.forEach(circle => {
      circle.to({
        duration: 1,
        scale: { x: 1.5, y: 1.5 },
        easing: Konva.Easings.EaseInOut
      });
    });
  }, []);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer ref={layerRef}>
        <Circle
          x={50}
          y={window.innerHeight / 2}
          radius={30}
          fill="red"
        />
        <Circle
          x={150}
          y={window.innerHeight / 2}
          radius={30}
          fill="green"
        />
        <Rect
          x={250}
          y={window.innerHeight / 2 - 25}
          width={50}
          height={50}
          fill="blue"
        />
      </Layer>
    </Stage>
  );
};

export default App;

import { Stage, Layer, Rect } from 'react-konva';
import { useRef, useState } from 'react';

const App = () => {
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - 25,
    y: window.innerHeight / 2 - 25
  });
  const layerRef = useRef(null);

  const handleClick = () => {
    // find rectangle by id and animate it
    const rectangle = layerRef.current.findOne('#myRect');
    rectangle.to({
      duration: 1,
      rotation: 360,
      fill: 'blue',
      easing: Konva.Easings.EaseInOut
    });
  };

  const handleDragEnd = (e) => {
    setPosition({
      x: e.target.x(),
      y: e.target.y()
    });
  };

  return (
    <div>
      <button onClick={handleClick} style={{ marginBottom: '10px' }}>
        Activate Rectangle
      </button>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer ref={layerRef}>
          <Rect
            x={position.x}
            y={position.y}
            width={50}
            height={50}
            fill="red"
            id="myRect"
            draggable
            onDragEnd={handleDragEnd}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default App;

import React from 'react';
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';
import { Portal } from 'react-konva-utils';

const App = () => {
  const [isDragging, setDragging] = React.useState(false);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text
          text="Try to drag the rectangle. It should be on top while drag."
          fontSize={15}
        />
        <Portal selector=".top-layer" enabled={isDragging}>
          <Rect
            x={20}
            y={50}
            width={150}
            height={150}
            fill="red"
            draggable={true}
            onDragStart={() => {
              setDragging(true);
            }}
            onDragEnd={() => {
              setDragging(false);
            }}
          />
        </Portal>
        <Circle x={200} y={100} radius={50} fill="green" />
        <Line
          x={20}
          y={200}
          points={[0, 0, 100, 0, 100, 100]}
          tension={0.5}
          closed
          stroke="black"
          fillLinearGradientStartPoint={{ x: -50, y: -50 }}
          fillLinearGradientEndPoint={{ x: 50, y: 50 }}
          fillLinearGradientColorStops={[0, 'red', 1, 'yellow']}
          draggable
        />
      </Layer>
      <Layer name="top-layer" />
    </Stage>
  );
};

export default App;

import React from 'react';
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';

const App = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text text="Some text on canvas" fontSize={15} />
        <Rect
          x={20}
          y={50}
          width={100}
          height={100}
          fill="red"
          shadowBlur={10}
        />
        <Circle x={200} y={100} radius={50} fill="green" />
        <Line
          x={20}
          y={200}
          points={[0, 0, 100, 0, 100, 100]}
          tension={0.5}
          closed
          stroke="black"
          fillLinearGradientStartPoint={{ x: -50, y: -50 }}
          fillLinearGradientEndPoint={{ x: 50, y: 50 }}
          fillLinearGradientColorStops={[0, 'red', 1, 'yellow']}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import React, { Component } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';


const App = () => {
  const [position, setPosition] = React.useState({ x: 20, y: 20 });
  // We use refs to keep history to avoid unnecessary re-renders
  const history = React.useRef([{ x: 20, y: 20 }]);
  const historyStep = React.useRef(0);

  const handleUndo = () => {
    if (historyStep.current === 0) {
      return;
    }
    historyStep.current -= 1;
    const previous = history.current[historyStep.current];
    setPosition(previous);
  };

  const handleRedo = () => {
    if (historyStep.current === history.current.length - 1) {
      return;
    }
    historyStep.current += 1;
    const next = history.current[historyStep.current];
    setPosition(next);
  };

  const handleDragEnd = (e) => {
    // Remove all states after current step
    history.current = history.current.slice(0, historyStep.current + 1);
    const pos = {
      x: e.target.x(),
      y: e.target.y(),
    };
    // Push the new state
    history.current = history.current.concat([pos]);
    historyStep.current += 1;
    setPosition(pos);
  };

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text text="undo" onClick={handleUndo} />
        <Text text="redo" x={40} onClick={handleRedo} />
        <Rect
          x={position.x}
          y={position.y}
          width={50}
          height={50}
          fill="black"
          draggable
          onDragEnd={handleDragEnd}
        />
      </Layer>
    </Stage>
  );
};

export default App;

import React from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const initialRectangles = [
  {
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    fill: 'red',
    id: 'rect1',
  },
  {
    x: 150,
    y: 150,
    width: 100,
    height: 100,
    fill: 'green',
    id: 'rect2',
  },
];

const App = () => {
  const [rectangles, setRectangles] = React.useState(initialRectangles);
  const [selectedId, selectShape] = React.useState(null);

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}
    >
      <Layer>
        {rectangles.map((rect, i) => {
          return (
            <Rectangle
              key={i}
              shapeProps={rect}
              isSelected={rect.id === selectedId}
              onSelect={() => {
                selectShape(rect.id);
              }}
              onChange={(newAttrs) => {
                const rects = rectangles.slice();
                rects[i] = newAttrs;
                setRectangles(rects);
              }}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};

export default App; 