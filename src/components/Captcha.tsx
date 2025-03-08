
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onCaptchaVerified: (isVerified: boolean) => void;
}

export const Captcha: React.FC<CaptchaProps> = ({ onCaptchaVerified }) => {
  const [captchaText, setCaptchaText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Generate a random captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setIsVerified(false);
    onCaptchaVerified(false);
  };

  // Verify the captcha
  const verifyCaptcha = () => {
    const isValid = userInput === captchaText;
    setIsVerified(isValid);
    onCaptchaVerified(isValid);
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

  return (
    <div className="space-y-3 py-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="captcha">Captcha</Label>
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

      <div className="flex items-center space-x-2">
        <div 
          className="font-mono text-base p-2 bg-muted border rounded-md select-none"
          style={{
            letterSpacing: '0.2em',
            fontStyle: 'italic',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'smallGrid\' width=\'10\' height=\'10\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 10 0 L 0 0 0 10\' fill=\'none\' stroke=\'%23AAA\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23smallGrid)\'/%3E%3C/svg%3E")',
          }}
        >
          {captchaText}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="captchaInput">Digite o código acima</Label>
        <Input
          id="captchaInput"
          placeholder="Digite o código do captcha"
          value={userInput}
          onChange={handleInputChange}
          onBlur={verifyCaptcha}
        />
      </div>
    </div>
  );
};
