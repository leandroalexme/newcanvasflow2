import React, { useState, useEffect } from 'react';
import './TextPanel.css';
import { DotsThree, TextAlignLeft, TextAlignCenter, TextAlignRight, TextAlignJustify, TextB, TextItalic, TextUnderline, TextStrikethrough } from '@phosphor-icons/react';
import Panel, { PanelHeader, PanelBody } from '../../ui/Panel/Panel';
import SliderControl from '../../ui/SliderControl/SliderControl';
import Dropdown from '../../ui/Dropdown/Dropdown';

const TextPanel = ({ isOpen, onClose, selectedElements, updateElementProperties }) => {
  const element = selectedElements?.[0];

  const [fontFamily, setFontFamily] = useState('Roboto');
  const [fontWeight, setFontWeight] = useState('Regular');
  const [fontStyle, setFontStyle] = useState('Style H1');
  const [fontSize, setFontSize] = useState(12);
  const [textAlign, setTextAlign] = useState('left');
  const [tracking, setTracking] = useState(12);
  const [baseline, setBaseline] = useState(12);
  const [textStyles, setTextStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  const [textCase, setTextCase] = useState('none');

  useEffect(() => {
    if (element && element.type === 'text') {
      setFontFamily(element.fontFamily || 'Roboto');
      setFontWeight(element.fontWeight || 'Regular');
      setFontSize(element.fontSize || 12);
      setTextAlign(element.textAlign || 'left');
      setTracking(element.letterSpacing || 0);
      setBaseline(element.baselineShift || 0);
      setTextStyles({
        bold: element.fontWeight === 'bold',
        italic: element.fontStyle === 'italic',
        underline: element.textDecoration === 'underline',
        strikethrough: element.textDecoration === 'line-through',
      });
      setTextCase(element.textCase || 'none');
    }
  }, [element]);

  const handlePropertyChange = (prop, value) => {
    if (element) {
      updateElementProperties(element.id, { [prop]: value });
    }
  };

  // Placeholder options
  const fontFamilies = ['Roboto', 'Arial', 'Verdana', 'Times New Roman'];
  const fontWeights = ['Regular', 'Medium', 'Bold', 'Black'];
  const fontStyles = ['Style H1', 'Style H2', 'Body', 'Caption'];

  const handleTextStyleChange = (style) => {
    const newStyles = { ...textStyles, [style]: !textStyles[style] };
    setTextStyles(newStyles);

    if (style === 'bold') {
      handlePropertyChange('fontWeight', newStyles.bold ? 'bold' : 'normal');
    } else if (style === 'italic') {
        handlePropertyChange('fontStyle', newStyles.italic ? 'italic' : 'normal');
    } else if (style === 'underline') {
        handlePropertyChange('textDecoration', newStyles.underline ? 'underline' : 'none');
    } else if (style === 'strikethrough') {
        handlePropertyChange('textDecoration', newStyles.strikethrough ? 'line-through' : 'none');
    }
  };

  const handleTextAlignChange = (align) => {
    setTextAlign(align);
    handlePropertyChange('textAlign', align);
  };

  const handleTextCaseChange = (tCase) => {
    setTextCase(tCase);
    handlePropertyChange('textCase', tCase);
  };

  const handleFontSizeDrag = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startSize = fontSize;

    const handleMouseMove = (moveEvent) => {
      const deltaY = startY - moveEvent.clientY; // Invertido: para cima aumenta
      const newSize = Math.round(startSize + deltaY);
      setFontSize(newSize);
      handlePropertyChange('fontSize', newSize);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Panel isOpen={isOpen} className="text-panel">
      <PanelHeader>
        <span className="panel-title">Character</span>
        <button className="more-options-button" onClick={onClose}>
          <DotsThree size={20} weight="bold" />
        </button>
      </PanelHeader>
      <PanelBody>
        <div className="font-selection-grid">
          <Dropdown 
            options={fontFamilies}
            selected={fontFamily}
            onSelect={(value) => {
                setFontFamily(value);
                handlePropertyChange('fontFamily', value);
            }}
          />
          <Dropdown 
            options={fontWeights}
            selected={fontWeight}
            onSelect={(value) => {
                setFontWeight(value);
                handlePropertyChange('fontWeight', value);
            }}
          />
          <Dropdown 
            options={fontStyles}
            selected={fontStyle}
            onSelect={(value) => {
                setFontStyle(value);
                // This would likely map to a set of properties, e.g., fontSize, fontWeight
                // For now, just a placeholder
                console.log("Style selected:", value);
            }}
          />
        </div>

        <div className="font-size-alignment-grid">
          <div className="font-size-input">
            <input 
                type="text" 
                value={`${fontSize}pt`} 
                onChange={(e) => {
                    const size = parseInt(e.target.value, 10) || 0;
                    setFontSize(size);
                    handlePropertyChange('fontSize', size);
                }}
                onFocus={(e) => e.target.select()}
                onMouseDown={handleFontSizeDrag}
            />
          </div>
          <div className="alignment-icons">
            <button onClick={() => handleTextAlignChange('left')} className={textAlign === 'left' ? 'active' : ''}><TextAlignLeft size={20} /></button>
            <button onClick={() => handleTextAlignChange('center')} className={textAlign === 'center' ? 'active' : ''}><TextAlignCenter size={20} /></button>
            <button onClick={() => handleTextAlignChange('right')} className={textAlign === 'right' ? 'active' : ''}><TextAlignRight size={20} /></button>
            <button onClick={() => handleTextAlignChange('justify')} className={textAlign === 'justify' ? 'active' : ''}><TextAlignJustify size={20} /></button>
          </div>
        </div>

        <div className="spacing-sliders">
          <SliderControl 
            label="Tracking"
            value={tracking}
            onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setTracking(value);
                handlePropertyChange('letterSpacing', value);
            }}
            min={-50}
            max={50}
          />
          <SliderControl 
            label="Baseline"
            value={baseline}
            onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setBaseline(value);
                handlePropertyChange('baselineShift', value);
            }}
            min={-50}
            max={50}
          />
        </div>

        <div className="text-style-buttons">
            <div className={`style-button ${textStyles.bold ? 'active' : ''}`} onClick={() => handleTextStyleChange('bold')}><TextB size={20} /></div>
            <div className={`style-button ${textStyles.italic ? 'active' : ''}`} onClick={() => handleTextStyleChange('italic')}><TextItalic size={20} /></div>
            <div className={`style-button ${textStyles.underline ? 'active' : ''}`} onClick={() => handleTextStyleChange('underline')}><TextUnderline size={20} /></div>
            <div className={`style-button ${textStyles.strikethrough ? 'active' : ''}`} onClick={() => handleTextStyleChange('strikethrough')}><TextStrikethrough size={20} /></div>
        </div>
        
        <div className="text-case-buttons">
            <div onClick={() => handleTextCaseChange('uppercase')} className={`case-button ${textCase === 'uppercase' ? 'active' : ''}`}>AA</div>
            <div onClick={() => handleTextCaseChange('capitalize')} className={`case-button ${textCase === 'capitalize' ? 'active' : ''}`}>Ab</div>
            <div onClick={() => handleTextCaseChange('lowercase')} className={`case-button ${textCase === 'lowercase' ? 'active' : ''}`}>ab</div>
            <div className="case-button">1/2</div>
        </div>

      </PanelBody>
    </Panel>
  );
};

export default TextPanel; 