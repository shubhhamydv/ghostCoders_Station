import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  async generateRoadmap(profile: any) {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Generate a personalized placement preparation roadmap for a student with the following profile: ${JSON.stringify(profile)}. 
      The roadmap should be step-by-step, including topics to study, resources, and a timeline.
      Return the response in JSON format matching the Roadmap interface.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['pending'] },
                  resources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        url: { type: Type.STRING }
                      }
                    }
                  },
                  order: { type: Type.NUMBER }
                },
                required: ['id', 'title', 'description', 'status', 'order']
              }
            }
          },
          required: ['title', 'steps']
        }
      }
    });
    return JSON.parse(response.text);
  },

  async getInterviewFeedback(question: string, answer: string, role: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Evaluate the following interview answer for the role of ${role}.
      Question: ${question}
      Answer: ${answer}
      Provide constructive feedback, a score (1-10), and a professional version of the answer using the STAR method.
      Return in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            score: { type: Type.NUMBER },
            professionalAnswer: { type: Type.STRING },
            confidenceTips: { type: Type.STRING }
          },
          required: ['feedback', 'score', 'professionalAnswer']
        }
      }
    });
    return JSON.parse(response.text);
  },

  async analyzeResume(resumeText: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following resume text: ${resumeText}. 
      Identify missing skills for a Software Engineer role, suggest better phrasing for existing points, and provide 3 key improvement tips.
      Return in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            phrasingSuggestions: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: {
                  original: { type: Type.STRING },
                  improved: { type: Type.STRING }
                }
              } 
            },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['missingSkills', 'phrasingSuggestions', 'tips']
        }
      }
    });
    return JSON.parse(response.text);
  },

  async improveCommunication(text: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Convert the following basic sentence into a professional, high-impact version suitable for an interview or resume: "${text}".
      Provide 3 variations. Return in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['variations']
        }
      }
    });
    return JSON.parse(response.text);
  },

  async generateQuiz(topic: string, difficulty: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 5-question multiple choice quiz on ${topic} with ${difficulty} difficulty.
      Include questions, options, and the correct answer index.
      Return in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.NUMBER },
                  explanation: { type: Type.STRING }
                },
                required: ['question', 'options', 'correctIndex']
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  },

  async generateCompanyRoadmap(companyName: string, userProfile: any) {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Generate a company-specific placement preparation roadmap for ${companyName} for a student with the following profile: ${JSON.stringify(userProfile)}. 
      The roadmap should be step-by-step, focusing on ${companyName}'s specific interview pattern and requirements.
      Return the response in JSON format matching the Roadmap interface.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['pending'] },
                  resources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        url: { type: Type.STRING }
                      }
                    }
                  },
                  order: { type: Type.NUMBER }
                },
                required: ['id', 'title', 'description', 'status', 'order']
              }
            }
          },
          required: ['title', 'steps']
        }
      }
    });
    return JSON.parse(response.text);
  }
};
