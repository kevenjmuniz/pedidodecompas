
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Plus, 
  Minus, 
  X, 
  Check,
  Triangle,
  Square,
  Circle
} from 'lucide-react';
import { toast } from 'sonner';

interface CaptchaProps {
  onCaptchaVerified: (isVerified: boolean) => void;
}

type CaptchaType = 'text' | 'math' | 'shape';
type MathOperation = '+' | '-' | 'x';
type Shape = 'triangle' | 'square' | 'circle';

interface ShapeQuestion {
  shapes: {
    type: Shape;
    count: number;
  }[];
  answer: number;
  question: string;
}

export const Captcha: React.FC<CaptchaProps> = ({ onCaptchaVerified }) => {
  // State for different types of captchas
  const [captchaType, setCaptchaType] = useState<CaptchaType>('text');
  const [textCaptcha, setTextCaptcha] = useState<string>('');
  const [mathCaptcha, setMathCaptcha] = useState<{
    num1: number;
    num2: number;
    operation: MathOperation;
    answer: number;
  }>({ num1: 0, num2: 0, operation: '+', answer: 0 });
  const [shapeCaptcha, setShapeCaptcha] = useState<ShapeQuestion>({
    shapes: [],
    answer: 0,
    question: ''
  });
  
  const [userInput, setUserInput] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  // Generate a random text captcha
  const generateTextCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    // Make it longer (8 chars) and mix case for added difficulty
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTextCaptcha(result);
    return result;
  };

  // Generate a random math captcha
  const generateMathCaptcha = () => {
    const operations: MathOperation[] = ['+', '-', 'x'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    // Larger numbers for more difficulty
    let num1 = Math.floor(Math.random() * 50) + 10;
    let num2 = Math.floor(Math.random() * 30) + 5;
    
    // Ensure subtraction doesn't result in negative numbers
    if (operation === '-' && num2 > num1) {
      [num1, num2] = [num2, num1];
    }
    
    let answer: number;
    switch (operation) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case 'x':
        answer = num1 * num2;
        break;
      default:
        answer = 0;
    }
    
    setMathCaptcha({ num1, num2, operation, answer });
    return { num1, num2, operation, answer };
  };

  // Generate a shape counting captcha
  const generateShapeCaptcha = () => {
    const shapes: Shape[] = ['triangle', 'square', 'circle'];
    const shapeObjects: {type: Shape, count: number}[] = [];
    
    // Generate random counts for each shape
    shapes.forEach(shape => {
      const count = Math.floor(Math.random() * 5); // 0-4 shapes of each type
      if (count > 0) {
        shapeObjects.push({
          type: shape,
          count
        });
      }
    });
    
    // If no shapes were generated, add at least one
    if (shapeObjects.length === 0) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      shapeObjects.push({
        type: shape,
        count: Math.floor(Math.random() * 3) + 1
      });
    }
    
    // Generate a question
    const questionTypes = [
      'total', // How many shapes in total?
      'specific' // How many of a specific shape?
    ];
    
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let question: string;
    let answer: number;
    
    if (questionType === 'total' || shapeObjects.length === 1) {
      question = 'Quantas formas existem no total?';
      answer = shapeObjects.reduce((sum, shape) => sum + shape.count, 0);
    } else {
      // Ask about a specific shape
      const targetShape = shapeObjects[Math.floor(Math.random() * shapeObjects.length)];
      question = `Quantos ${getShapeName(targetShape.type)} existem?`;
      answer = targetShape.count;
    }
    
    setShapeCaptcha({
      shapes: shapeObjects,
      answer,
      question
    });
    
    return { shapes: shapeObjects, answer, question };
  };

  const getShapeName = (shape: Shape): string => {
    switch (shape) {
      case 'triangle': return 'triângulos';
      case 'square': return 'quadrados';
      case 'circle': return 'círculos';
      default: return '';
    }
  };

  // Render the appropriate operation symbol
  const renderOperation = (operation: MathOperation) => {
    switch (operation) {
      case '+': return <Plus size={18} />;
      case '-': return <Minus size={18} />;
      case 'x': return <X size={18} />;
      default: return null;
    }
  };

  // Render a shape based on its type
  const renderShape = (shape: Shape) => {
    switch (shape) {
      case 'triangle': return <Triangle className="text-primary" />;
      case 'square': return <Square className="text-secondary" />;
      case 'circle': return <Circle className="text-accent" />;
      default: return null;
    }
  };

  // Generate a new captcha
  const generateCaptcha = () => {
    // Select a random captcha type
    const types: CaptchaType[] = ['text', 'math', 'shape'];
    const newType = types[Math.floor(Math.random() * types.length)];
    setCaptchaType(newType);
    
    // Generate the appropriate captcha
    switch (newType) {
      case 'text':
        generateTextCaptcha();
        break;
      case 'math':
        generateMathCaptcha();
        break;
      case 'shape':
        generateShapeCaptcha();
        break;
    }
    
    setUserInput('');
    setIsVerified(false);
    onCaptchaVerified(false);
  };

  // Verify the captcha
  const verifyCaptcha = () => {
    let isValid = false;
    
    switch (captchaType) {
      case 'text':
        isValid = userInput === textCaptcha;
        break;
      case 'math':
        isValid = parseInt(userInput) === mathCaptcha.answer;
        break;
      case 'shape':
        isValid = parseInt(userInput) === shapeCaptcha.answer;
        break;
    }
    
    if (isValid) {
      setIsVerified(true);
      onCaptchaVerified(true);
      toast.success('Captcha verificado com sucesso!');
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        // After 3 failed attempts, generate a new captcha
        toast.error('Muitas tentativas falhas. Gerando novo captcha...');
        generateCaptcha();
        setAttempts(0);
      } else {
        toast.error('Verificação falhou. Tente novamente.');
      }
      onCaptchaVerified(false);
    }
    
    return isValid;
  };

  // Generate captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    // If previously verified, reset verification status
    if (isVerified) {
      setIsVerified(false);
      onCaptchaVerified(false);
    }
  };

  // Render the captcha challenge
  const renderCaptchaChallenge = () => {
    switch (captchaType) {
      case 'text':
        return (
          <div 
            className="font-mono text-base p-3 bg-muted border rounded-md select-none"
            style={{
              letterSpacing: '0.25em',
              fontStyle: 'italic',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'smallGrid\' width=\'10\' height=\'10\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 10 0 L 0 0 0 10\' fill=\'none\' stroke=\'%23AAA\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23smallGrid)\'/%3E%3C/svg%3E")',
              transform: 'skew(-5deg, 2deg)',
              position: 'relative'
            }}
          >
            {/* Add noise and distortions to make OCR harder */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30"></div>
            {textCaptcha.split('').map((char, index) => (
              <span 
                key={index} 
                style={{
                  display: 'inline-block',
                  transform: `rotate(${Math.random() * 10 - 5}deg)`,
                  marginRight: '2px',
                  position: 'relative',
                  top: `${Math.random() * 6 - 3}px`
                }}
              >
                {char}
              </span>
            ))}
          </div>
        );
      
      case 'math':
        return (
          <div className="flex items-center justify-center gap-2 text-xl font-bold py-3">
            <span>{mathCaptcha.num1}</span>
            <span className="flex items-center justify-center w-6 h-6">
              {renderOperation(mathCaptcha.operation)}
            </span>
            <span>{mathCaptcha.num2}</span>
            <span>=</span>
            <span>?</span>
          </div>
        );
      
      case 'shape':
        return (
          <div className="space-y-3">
            <p className="text-center font-medium">{shapeCaptcha.question}</p>
            
            <div className="flex flex-wrap gap-3 justify-center p-3 bg-muted/50 rounded-md min-h-20">
              {shapeCaptcha.shapes.map((shapeObj, shapeIndex) => (
                <div key={shapeIndex} className="flex flex-wrap gap-2">
                  {Array(shapeObj.count).fill(0).map((_, index) => (
                    <div key={`${shapeObj.type}-${index}`} className="w-6 h-6 flex items-center justify-center">
                      {renderShape(shapeObj.type)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 py-2">
      <div className="flex justify-between items-center">
        <Label>Verificação de Segurança</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateCaptcha}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refrescar Captcha</span>
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        {renderCaptchaChallenge()}
      </div>

      <div className="space-y-2">
        <Label htmlFor="captchaInput">Digite a resposta</Label>
        <Input
          id="captchaInput"
          placeholder={captchaType === 'text' ? "Digite o texto acima" : "Digite o número"}
          value={userInput}
          onChange={handleInputChange}
          onBlur={verifyCaptcha}
          className="text-center"
        />
        {isVerified && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <Check size={16} />
            <span>Verificado</span>
          </div>
        )}
      </div>
    </div>
  );
};
