
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      messages, 
      userRole, 
      isVoiceCommand = false, 
      currentPath = '/', 
      language = 'en',
      isEducational = false,
      currentSubject = 'general',
      hasImage = false
    } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages are required');
    }

    console.log("Request received:", { 
      isVoiceCommand, 
      currentPath, 
      language, 
      isEducational, 
      hasImage 
    });

    // Create system prompt based on user role and context
    let systemPrompt = `You are an educational AI assistant focused on helping ${userRole === 'teacher' ? 'teachers' : 'students'} with their learning journey. `;
    
    // Add voice command context if needed
    if (isVoiceCommand) {
      systemPrompt += `This is a voice command, so keep your responses brief and clear. If the user is asking to navigate somewhere, format your response as "Navigating to [destination]" or "Switching to [tab] tab". `;
      
      // Add language-specific instructions
      if (language !== 'en') {
        systemPrompt += `The user's current language is ${language}. If the voice command is in Hindi or another Indian language, respond in the same language. For commands about switching languages, confirm in the target language. `;
      }
    }

    // Add page context
    systemPrompt += `The user is currently on ${currentPath} page. `;

    // Add educational context if needed
    if (isEducational) {
      systemPrompt += `The user is asking you about ${currentSubject}. `;
      if (hasImage) {
        systemPrompt += `The user has uploaded an image, likely showing a problem they need help with. `;
      }
      systemPrompt += `Provide detailed, educational responses that help the user learn. Break down complex concepts into simpler parts and use examples where appropriate. `;
    }

    // Add path-specific context
    if (currentPath.includes('dashboard')) {
      systemPrompt += `The dashboard contains tabs for Overview, Courses, Assignments, Materials, Discussions, and Analytics. The user can switch between them using voice commands like "switch to assignments tab".`;
    } else if (currentPath.includes('learn')) {
      systemPrompt += `This is a course learning page where the user can navigate through lessons. Voice commands like "next lesson", "previous lesson", or "mark as complete" are supported.`;
    } else if (currentPath.includes('edu-chat')) {
      systemPrompt += `This is the educational chatbot page where users can ask learning questions. Try to give educational responses with good explanations. For math problems, show step-by-step solutions.`;
    }

    // Add multilingual response handling
    if (language !== 'en') {
      // Add language-specific instructions based on detected language
      switch (language) {
        case 'hi':
          systemPrompt += `User is using Hindi as their preferred language. If appropriate, respond in Hindi.`;
          break;
        case 'bn':
          systemPrompt += `User is using Bengali as their preferred language. If appropriate, respond in Bengali.`;
          break;
        case 'ta':
          systemPrompt += `User is using Tamil as their preferred language. If appropriate, respond in Tamil.`;
          break;
        case 'te':
          systemPrompt += `User is using Telugu as their preferred language. If appropriate, respond in Telugu.`;
          break;
        default:
          // For other languages, respond in English unless the command was in another language
          systemPrompt += `If the user speaks in a language other than English, try to respond in the same language.`;
      }
    }

    // Extract user message
    const userMessage = messages[messages.length - 1].content;
    console.log("User message:", userMessage);
    
    // Process command directly without AI for common patterns
    const lowerCaseCommand = userMessage.toLowerCase();
    let directResponse = null;
    let languageToSet = null;
    
    // Handle navigation commands directly
    if (isVoiceCommand) {
      // Check for tab switching commands
      if (/switch to (\w+) tab|go to (\w+) tab|open (\w+) tab/.test(lowerCaseCommand)) {
        const tabMatch = lowerCaseCommand.match(/(?:switch|go|open) to (\w+) tab/);
        let tabName = tabMatch ? tabMatch[1] : '';
        
        if (tabName) {
          return new Response(
            JSON.stringify({ response: `Switching to ${tabName} tab` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      // Check for navigation commands
      if (/navigate to|go to|open/.test(lowerCaseCommand)) {
        if (lowerCaseCommand.includes('dashboard')) {
          return new Response(
            JSON.stringify({ response: "Navigating to dashboard" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        if (lowerCaseCommand.includes('courses') || lowerCaseCommand.includes('my courses')) {
          return new Response(
            JSON.stringify({ response: "Navigating to courses" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        if (lowerCaseCommand.includes('profile')) {
          return new Response(
            JSON.stringify({ response: "Navigating to profile" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (lowerCaseCommand.includes('explore')) {
          return new Response(
            JSON.stringify({ response: "Navigating to explore" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }
    
    // Check for translation commands
    if (lowerCaseCommand.includes('translate to')) {
      const langMatch = lowerCaseCommand.match(/translate to (\w+)/i);
      if (langMatch && langMatch[1]) {
        const langName = langMatch[1].toLowerCase();
        
        // Map common language names to language codes
        const langMapping = {
          'english': 'en',
          'hindi': 'hi',
          'bengali': 'bn',
          'tamil': 'ta',
          'telugu': 'te',
          'kannada': 'kn',
          'malayalam': 'ml',
          'marathi': 'mr',
          'gujarati': 'gu',
          'punjabi': 'pa',
          'spanish': 'es',
          'french': 'fr'
        };
        
        if (langMapping[langName]) {
          const response = langName === 'hindi' 
            ? "हिंदी में अनुवाद हो रहा है" 
            : `Translating to ${langName}`;
            
          return new Response(
            JSON.stringify({ response, languageToSet: langMapping[langName] }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }
    
    // Hindi translation command
    if (lowerCaseCommand.includes('हिंदी में अनुवाद') || 
        lowerCaseCommand.includes('हिंदी में बदलो')) {
      return new Response(
        JSON.stringify({ response: "हिंदी में अनुवाद हो रहा है", languageToSet: 'hi' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Educational context processing
    if (isEducational) {
      // Math problem detection and answers
      if (lowerCaseCommand.includes('what is') && 
          /\d+\s*[\+\-\*\/]\s*\d+/.test(lowerCaseCommand)) {
        // Basic math expression detection
        const expression = lowerCaseCommand.match(/(\d+\s*[\+\-\*\/]\s*\d+)/)[0];
        let result;
        
        try {
          // Clean up expression and evaluate it safely
          const cleanExpr = expression.replace(/\s+/g, '');
          let nums = [];
          let operator = '';
          
          if (cleanExpr.includes('+')) {
            nums = cleanExpr.split('+');
            operator = '+';
            result = parseFloat(nums[0]) + parseFloat(nums[1]);
          } else if (cleanExpr.includes('-')) {
            nums = cleanExpr.split('-');
            operator = '-';
            result = parseFloat(nums[0]) - parseFloat(nums[1]);
          } else if (cleanExpr.includes('*')) {
            nums = cleanExpr.split('*');
            operator = '×';
            result = parseFloat(nums[0]) * parseFloat(nums[1]);
          } else if (cleanExpr.includes('/')) {
            nums = cleanExpr.split('/');
            operator = '÷';
            if (parseFloat(nums[1]) === 0) {
              result = "undefined (division by zero)";
            } else {
              result = parseFloat(nums[0]) / parseFloat(nums[1]);
            }
          }
          
          // Format response based on language
          let response;
          if (language === 'hi') {
            response = `${nums[0]} ${operator} ${nums[1]} = ${result}\n\nयह एक बुनियादी गणितीय अभिव्यक्ति है। आप मुझसे और जटिल गणित प्रश्न भी पूछ सकते हैं।`;
          } else {
            response = `${nums[0]} ${operator} ${nums[1]} = ${result}\n\nThis is a basic arithmetic expression. You can ask me more complex math questions as well.`;
          }
          
          return new Response(
            JSON.stringify({ response }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (err) {
          console.log("Error evaluating expression:", err);
          // Continue to general handler if expression evaluation fails
        }
      }
    }
    
    // For simplicity, generate appropriate educational responses
    let response;
    if (isEducational) {
      if (lowerCaseCommand.includes('what is') || lowerCaseCommand.includes('explain')) {
        const topic = lowerCaseCommand.replace(/what is|explain/gi, '').trim();
        if (topic) {
          switch (currentSubject) {
            case 'math':
              response = `Let me explain ${topic} in mathematics. This is a fundamental concept that involves [detailed explanation would be here]. Would you like me to go into more detail or provide some examples?`;
              break;
            case 'science':
              response = `${topic} is an important concept in science. It refers to [detailed explanation would be here]. Does this help with your understanding, or would you like more information?`;
              break;
            case 'history':
              response = `In history, ${topic} refers to [detailed explanation would be here]. This had significant impact on [related historical events]. Would you like to know more about this topic?`;
              break;
            default:
              response = `${topic} is a fascinating subject. Let me explain: [detailed explanation would be here]. Would you like to explore this topic further?`;
          }
        }
      }
      
      if (hasImage) {
        response = `I can see you've uploaded an image. Based on what's shown, this appears to be a problem related to [subject analysis]. To solve it, I would approach it by: 1) [first step], 2) [second step], 3) [conclusion]. Would you like me to explain any part in more detail?`;
      }
    }
    
    // Language-specific default responses if no specific response was generated
    if (!response) {
      if (language === 'hi') {
        response = "मैं आपकी कैसे मदद कर सकता हूँ? मैं विभिन्न विषयों पर सवालों के जवाब दे सकता हूँ, समस्याओं को हल कर सकता हूँ, और नए विषयों को समझने में आपकी मदद कर सकता हूँ।";
      } else if (language === 'bn') {
        response = "আমি আপনাকে কিভাবে সাহায্য করতে পারি? আমি বিভিন্ন বিষয়ে প্রশ্নের উত্তর দিতে পারি, সমস্যা সমাধান করতে পারি এবং নতুন বিষয় বুঝতে আপনাকে সাহায্য করতে পারি।";
      } else if (language === 'ta') {
        response = "நான் உங்களுக்கு எவ்வாறு உதவ முடியும்? நான் பல்வேறு பொருள்களில் கேள்விகளுக்கு பதிலளிக்க முடியும், பிரச்சினைகளைத் தீர்க்க முடியும், மற்றும் புதிய பொருட்களைப் புரிந்துகொள்ள உங்களுக்கு உதவ முடியும்.";
      } else if (language === 'te') {
        response = "నేను మీకు ఎలా సహాయం చేయగలను? నేను వివిధ అంశాలపై ప్రశ్నలకు సమాధానం ఇవ్వగలను, సమస్యలను పరిష్కరించగలను మరియు కొత్త అంశాలను అర్థం చేసుకోవడంలో మీకు సహాయం చేయగలను.";
      } else {
        if (isEducational) {
          response = "I'm here to help with your educational questions. You can ask me to explain concepts, solve problems, or help you understand new subjects. What would you like to learn about today?";
        } else if (isVoiceCommand) {
          response = "I'm sorry, I couldn't process that command. How can I help you?";
        } else {
          response = "How can I assist you today? I can answer questions on various subjects, solve problems, and help you understand new topics.";
        }
      }
    }
    
    console.log("Generated response:", response);

    return new Response(
      JSON.stringify({ response, languageToSet }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in AI Chat:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
