/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { 
    GENRE_CATEGORIES, GENRES, LANGUAGES, STYLE_CELEBS, STYLE_ART, STYLE_WORKS, PAGE_COUNTS, isMV,
    ComicFace, ComicPanelData, Persona, Item, Location, ComicLayout, TOTAL_PAGES,
    AspectRatio, AudioTrack, MASTERPIECE_DB, ProjectHistory, UILanguage, UI_TRANSLATIONS, LYRIC_LANGUAGES, SavedConfig,
    getVisualBaseInstruction, SceneMetadata, ProjectFile, ART_STYLES, VEO_MODELS
} from './types';
import { Setup } from './Setup';
import { Book } from './Book';
import { VideoEditor } from './VideoEditor';
import { SunoDialog } from './SunoDialog';
import { useApiKey } from './useApiKey';
import { ApiKeyDialog } from './ApiKeyDialog';
import { LoadingFX } from './LoadingFX';

// --- Constants ---
const MODEL_V3_IMAGE = "gemini-3-pro-image-preview";
const MODEL_DIRECTOR = "gemini-3-pro-preview"; 
const MODEL_VIDEO = "veo-3.1-fast-generate-preview"; 
const MODEL_VISION = "gemini-3-pro-preview"; 

type GenerateContentResponse = {
  text?: string;
  candidates?: Array<{ content?: { parts?: Array<any> } }>;
};

const GATEWAY_BASE_URL = "https://ai.t8star.cn";
const RATIO_TO_SIZE: Record<string, string> = { "1:1": "1024x1024", "16:9": "1024x576", "9:16": "576x1024" };

interface ScriptPage {
    pageIndex: number;
    layout: ComicLayout;
    sceneMetadata?: SceneMetadata;
    panels: {
        scene: string;
        caption?: string;
        dialogue?: string;
        focus_char: string;
        camera?: string;
        lighting?: string;
        sound_fx?: string;
    }[];
    choices?: string[];
}

const getGenreCategory = (genre: string): string => {
    for (const [cat, list] of Object.entries(GENRE_CATEGORIES)) {
        if (list.includes(genre)) return cat;
    }
    return "影视 (Film/TV)"; 
};

const getAgentSystemInstruction = (genre: string) => {
    const category = getGenreCategory(genre);
    
    if (category.includes("MV") || genre.includes("MV")) {
        return {
            role: "Master Music Video Director & Choreographer (like Michel Gondry, Dave Meyers, or Spike Jonze).",
            task_desc: "Create a visually driven Music Video treatment.",
            focus: "Visual rhythm, beat synchronization, choreography, lighting, and mood. MINIMAL DIALOGUE.",
            structure_guide: "Structure: Intro (Mood Setter) -> Verse 1 (Narrative/Performance) -> Chorus (High Energy/Dance) -> Bridge (Visual Shift) -> Outro (Fade).",
            output_advice: "Focus on visual flow and editing beats. Dialogue should be lyrics or silence. Describe camera movement matching the music tempo."
        };
    }
    if (category.includes("Ads") || genre.includes("广告")) {
        return {
            role: "Cannes Lions Award-winning Creative Director (Ogilvy/Leo Burnett style).",
            task_desc: "Create a high-impact Commercial / Ad Spot.",
            focus: "Brand impact, product showcase, consumer insight, and visual persuasion.",
            structure_guide: "Structure: The Hook (0-3s, Attention Grabber) -> The Pain/Need -> The Solution (Product) -> The Benefit (Euphoria) -> Call to Action.",
            output_advice: "Dialogue must be punchy slogans or sharp copy. Visuals should be high-end commercial quality. Pacing is extremely fast."
        };
    }
    if (category.includes("Short Drama") || genre.includes("短剧")) {
        return {
            role: "Viral Short Video Scriptwriter (TikTok/Reels/Douyin Expert).",
            task_desc: "Create a viral Vertical Drama script.",
            focus: "High retention, immediate hooks, emotional reversals, and 'face-slapping' moments.",
            structure_guide: "Structure: 3-second Hook -> Intense Conflict Setup -> Escalation -> Immediate Reversal/Climax -> Cliffhanger.",
            output_advice: "Pacing must be breathless. Dialogue is sharp, conflict-driven, and emotional. Every scene must end with a hook."
        };
    }
    if (category.includes("Anime") || genre.includes("动漫")) {
        return {
            role: "Veteran Anime Series Director & Composition Writer.",
            task_desc: "Create an Anime Episode storyboard.",
            focus: "Character expression (sakuga moments), world-building, and emotional resonance.",
            structure_guide: "Structure: Introduction (Setup) -> Inciting Incident -> Rising Action (Battle/Drama) -> Climax (Sakuga) -> Resolution.",
            output_advice: "Include internal monologues. Visuals should describe exaggerated expressions, speed lines, and anime tropes."
        };
    }
    return {
        role: "Master Screenwriter and Film Theorist (like Robert McKee or Syd Field).",
        task_desc: "Create a Cinematic Film Narrative.",
        focus: "Cinematic storytelling, character arc, visual subtext, and thematic depth.",
        structure_guide: "Structure: Act 1 (The Status Quo & Inciting Incident) -> Act 2 (Progressive Complications) -> Act 3 (The Crisis & Climax) -> Resolution.",
        output_advice: "Focus on subtext and cinematic visual language. Show, don't tell."
    };
};

const App: React.FC = () => {
  const { validateApiKey, setShowApiKeyDialog, showApiKeyDialog, handleApiKeyDialogContinue } = useApiKey();

  const [userId, setUserId] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ProjectHistory[]>([]);
  const [uiLanguage, setUiLanguage] = useState<UILanguage>('zh');

  const [heroes, setHeroesState] = useState<Persona[]>([]);
  const [supports, setSupportsState] = useState<Persona[]>([]);
  const [items, setItemsState] = useState<Item[]>([]);
  const [locations, setLocationsState] = useState<Location[]>([]);
  
  const defaultGenreCat = Object.keys(GENRE_CATEGORIES)[1]; 
  const defaultGenre = GENRE_CATEGORIES[defaultGenreCat][0];
  const [selectedGenre, setSelectedGenre] = useState(defaultGenre);
  
  const [selectedDirector, setSelectedDirector] = useState(STYLE_CELEBS[1]); 
  const [selectedArtStyle, setSelectedArtStyle] = useState(STYLE_ART[1]);
  const [selectedRefWork, setSelectedRefWork] = useState(STYLE_WORKS[1]);
  const [customStylePrompt, setCustomStylePrompt] = useState(""); 

  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].code);
  const [selectedPageCount, setSelectedPageCount] = useState(PAGE_COUNTS[1]); 
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('16:9'); 
  const [selectedVideoModel, setSelectedVideoModel] = useState<string>("veo3.1-pro");
  const [customPremise, setCustomPremise] = useState("");
  const [richMode, setRichMode] = useState(true);
  
  const [viewMode, setViewMode] = useState<'book' | 'list' | 'editor'>('list'); 
  const [audioTrack, setAudioTrack] = useState<AudioTrack | undefined>(undefined);
  const [showSunoDialog, setShowSunoDialog] = useState(false);
  
  const [dynamicGenres, setDynamicGenres] = useState<string[]>([]);
  const [dynamicDirectors, setDynamicDirectors] = useState<string[]>([]);
  const [dynamicArtStyles, setDynamicArtStyles] = useState<string[]>([]);
  const [dynamicWorks, setDynamicWorks] = useState<string[]>([]);
  
  const [masterpieceRef, setMasterpieceRef] = useState<string>("");

  const [isTransitioning, setIsTransitioning] = useState(false); 
  const [loadingAction, setLoadingAction] = useState<string | null>(null); 

  const heroesRef = useRef<Persona[]>([]);
  const supportsRef = useRef<Persona[]>([]);
  const itemsRef = useRef<Item[]>([]);
  const locsRef = useRef<Location[]>([]);
  const detectedVisualBaseRef = useRef<string>("");
  const detectedVisualCategoryRef = useRef<'REAL' | '2D' | '3D' | 'UNKNOWN'>('UNKNOWN');

  const updateHeroes = (newHeroes: Persona[]) => { setHeroesState(newHeroes); heroesRef.current = newHeroes; };
  const updateSupports = (newSupports: Persona[]) => { setSupportsState(newSupports); supportsRef.current = newSupports; };
  const updateItems = (newItems: Item[]) => { setItemsState(newItems); itemsRef.current = newItems; };
  const updateLocs = (newLocs: Location[]) => { setLocationsState(newLocs); locsRef.current = newLocs; };

  const [comicFaces, setComicFaces] = useState<ComicFace[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
      let uid = localStorage.getItem('infinite_heroes_uid');
      if (!uid) {
          uid = `user_${Date.now()}_${Math.floor(Math.random()*1000)}`;
          localStorage.setItem('infinite_heroes_uid', uid);
      }
      setUserId(uid);
      loadHistory();
  }, []);

  useEffect(() => {
      if (!isStarted) return;
      const timer = setInterval(() => {
          saveProject(false);
      }, 60000);
      return () => clearInterval(timer);
  }, [isStarted, comicFaces, audioTrack]);

  useEffect(() => {
      const code = selectedLanguage;
      if (code.includes('zh') || code.includes('CN')) setUiLanguage('zh');
      else setUiLanguage('en');
  }, [selectedLanguage]);

  const loadHistory = () => {
      try {
          const raw = localStorage.getItem('infinite_heroes_projects');
          if (raw) setSavedProjects(JSON.parse(raw));
      } catch (e) { console.error("Load History Error", e); }
  };

  const saveProject = (manual = false) => {
      if (!isStarted || comicFaces.length === 0) return;
      const newHistoryItem: ProjectHistory = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          premise: customPremise || selectedGenre,
          genre: selectedGenre,
          faces: comicFaces,
          heroes: heroesRef.current,
          audio: audioTrack
      };
      try {
          const currentList = JSON.parse(localStorage.getItem('infinite_heroes_projects') || "[]");
          const updatedList = [newHistoryItem, ...currentList.filter((p: ProjectHistory) => p.id !== newHistoryItem.id)].slice(20);
          localStorage.setItem('infinite_heroes_projects', JSON.stringify(updatedList));
          setSavedProjects(updatedList);
          if (manual) alert("Project Saved to Local Browser History!");
      } catch (e) { if (manual) alert("Storage Full! Clear some history."); }
  };

  const handleSaveProjectToFile = () => {
      const project: ProjectFile = {
          version: 1,
          timestamp: Date.now(),
          settings: {
              genre: selectedGenre,
              style: `${selectedDirector} | ${selectedArtStyle} | ${selectedRefWork}`,
              customStyle: customStylePrompt,
              lang: selectedLanguage,
              pageCount: selectedPageCount,
              aspectRatio: selectedAspectRatio,
              premise: customPremise
          },
          assets: {
              heroes: heroesRef.current,
              supports: supportsRef.current,
              items: itemsRef.current,
              locations: locsRef.current
          },
          content: {
              faces: comicFaces,
              audio: audioTrack
          }
      };
      const blob = new Blob([JSON.stringify(project, null, 2)], {type: "application/json"});
      saveAs(blob, `InfiniteProject_${Date.now()}.infinite`);
  };

  const handleLoadProjectFromFile = async (file: File) => {
      try {
          const text = await file.text();
          const project: ProjectFile = JSON.parse(text);
          if (!project.version) throw new Error("Invalid Project File");

          setSelectedGenre(project.settings.genre);
          const parts = project.settings.style.split('|');
          if (parts.length === 3) {
              setSelectedDirector(parts[0].trim());
              setSelectedArtStyle(parts[1].trim());
              setSelectedRefWork(parts[2].trim());
          } else {
              setSelectedDirector(project.settings.style);
          }
          
          setCustomStylePrompt(project.settings.customStyle);
          setSelectedLanguage(project.settings.lang);
          setSelectedPageCount(project.settings.pageCount);
          setSelectedAspectRatio(project.settings.aspectRatio);
          setCustomPremise(project.settings.premise);
          
          updateHeroes(project.assets.heroes || []);
          updateSupports(project.assets.supports || []);
          updateItems(project.assets.items || []);
          updateLocs(project.assets.locations || []);

          setComicFaces(project.content.faces);
          setAudioTrack(project.content.audio);
          
          setIsStarted(true);
          setShowSetup(false);
          setViewMode('list');
          alert("Project Loaded Successfully!");
      } catch (e) {
          alert("Failed to load project: " + String(e));
      }
  };

  const loadPreset = (config: SavedConfig) => {
      setSelectedGenre(config.genre);
      const parts = config.style.split('|');
      if (parts.length === 3) {
          setSelectedDirector(parts[0].trim());
          setSelectedArtStyle(parts[1].trim());
          setSelectedRefWork(parts[2].trim());
      } else {
          setSelectedDirector(config.style);
      }
      setCustomStylePrompt(config.customStyle);
      setSelectedLanguage(config.lang);
      setSelectedPageCount(config.pageCount);
      setSelectedAspectRatio(config.aspectRatio);
      setCustomPremise(config.premise);
      setRichMode(config.richMode);
      updateHeroes(config.heroes);
      updateSupports(config.supports);
  };

  const exportProjectAsZip = async () => {
      const zip = new JSZip();
      const imgFolder = zip.folder("images");
      const videoFolder = zip.folder("videos");
      const promptFolder = zip.folder("prompts");
      const anchorFolder = zip.folder("anchors");

      const projectData = {
          title: customPremise || "Untitled Project",
          genre: selectedGenre,
          created_at: new Date().toISOString(),
          scenes: [] as any[]
      };

      let scriptText = `# ${customPremise || "Project Script"}\n\n`;
      scriptText += `**Genre:** ${selectedGenre}\n**Director:** ${selectedDirector}\n**Art Style:** ${selectedArtStyle}\n\n---\n`;

      for (const face of comicFaces) {
          let sceneNumStr = "00";
          if (face.type === 'story') sceneNumStr = (face.pageIndex || 0).toString().padStart(2, '0');
          else if (face.type === 'back_cover') sceneNumStr = "99";

          if (face.sceneData) {
              if (face.sceneData.anchor_costume_url && anchorFolder) {
                  const b64 = face.sceneData.anchor_costume_url.split(',')[1];
                  const fname = `scene_${sceneNumStr}_anchor_costume.jpg`;
                  anchorFolder.file(fname, b64, {base64: true});
              }
              if (face.sceneData.anchor_environment_url && anchorFolder) {
                  const b64 = face.sceneData.anchor_environment_url.split(',')[1];
                  const fname = `scene_${sceneNumStr}_anchor_env.jpg`;
                  anchorFolder.file(fname, b64, {base64: true});
              }
          }

          const sceneEntry = {
              type: face.type,
              scene_index: sceneNumStr,
              metadata: face.sceneData,
              shots: [] as any[]
          };

          if (face.type === 'story') {
              scriptText += `\n## SCENE ${sceneNumStr}\n`;
              if (face.sceneData) {
                  scriptText += `> **Setting:** ${face.sceneData.setting}\n> **Mood:** ${face.sceneData.mood}\n\n`;
              }
          } else if (face.type === 'cover') {
              scriptText += `\n## POSTER / COVER\n\n`;
          } else if (face.type === 'back_cover') {
              scriptText += `\n## ENDING CARD\n\n`;
          }

          for (const p of face.panels) {
              const shotNumStr = (p.index + 1).toString().padStart(2, '0');
              const baseFilename = `scene_${sceneNumStr}_shot_${shotNumStr}`;
              
              const visualAction = p.scene || "No description";

              const shotEntry: any = {
                  shot_index: shotNumStr,
                  user_action_description: visualAction,
                  dialogue: p.dialogue,
                  prompt_used: p.prompt,
                  image_file: null,
                  video_file: null,
                  prompt_file: null
              };

              scriptText += `### Shot ${shotNumStr}\n`;
              scriptText += `**Visual Action**: ${visualAction}\n`;
              if (p.dialogue) scriptText += `**Dialogue**: "${p.dialogue}"\n`;
              scriptText += `\n`;

              if (p.imageUrl && imgFolder) {
                  const base64Data = p.imageUrl.split(',')[1];
                  const filename = `${baseFilename}.png`;
                  imgFolder.file(filename, base64Data, {base64: true});
                  shotEntry.image_file = `images/${filename}`;
              }
              if (p.lastFrameUrl && imgFolder) {
                  const base64Data = p.lastFrameUrl.split(',')[1];
                  const filename = `${baseFilename}_end.png`;
                  imgFolder.file(filename, base64Data, {base64: true});
                  shotEntry.image_end_file = `images/${filename}`;
              }

              if (promptFolder) {
                  const filename = `${baseFilename}.txt`;
                  promptFolder.file(filename, visualAction);
                  shotEntry.prompt_file = `prompts/${filename}`;
              }

              if (p.videoUrl && videoFolder) {
                  try {
                      const vidRes = await fetch(p.videoUrl);
                      if (vidRes.ok) {
                          const blob = await vidRes.blob();
                          const vname = `${baseFilename}.mp4`;
                          videoFolder.file(vname, blob);
                          shotEntry.video_file = `videos/${vname}`;
                      }
                  } catch (e) { console.warn("Could not export video", p.id); }
              }

              sceneEntry.shots.push(shotEntry);
          }
          
          if (face.type === 'story') scriptText += `---\n`;
          projectData.scenes.push(sceneEntry);
      }

      zip.file("metadata.json", JSON.stringify(projectData, null, 2));
      zip.file("script.md", scriptText);

      if (audioTrack) {
          if (audioTrack.url) {
              try {
                  const audioRes = await fetch(audioTrack.url);
                  if (audioRes.ok) {
                      const blob = await audioRes.blob();
                      zip.file("soundtrack.mp3", blob);
                  }
              } catch(e) { console.warn("Could not export audio"); }
          }
          const musicText = `Title: ${audioTrack.title || 'Untitled'}\nStyle: ${audioTrack.style}\nLyrics:\n${audioTrack.lyrics}`;
          zip.file("music_settings.txt", musicText);
      }

      const content = await zip.generateAsync({type:"blob"});
      saveAs(content, `infinite_director_${Date.now()}.zip`);
  };

  const getAI = () => {
    const textKey = (process.env as any).TEXT_API_KEY || process.env.API_KEY || (process.env as any).GEMINI_API_KEY || "";
    const imageKey = (process.env as any).IMAGE_API_KEY || process.env.API_KEY || (process.env as any).GEMINI_API_KEY || "";
    const videoKey = (process.env as any).VIDEO_API_KEY || process.env.API_KEY || (process.env as any).GEMINI_API_KEY || "";
    const authText = { Authorization: `Bearer ${textKey}` } as Record<string, string>;
    const authImage = { Authorization: `Bearer ${imageKey}` } as Record<string, string>;
    const authVideo = { Authorization: `Bearer ${videoKey}` } as Record<string, string>;

    const normalizeContents = (contents: any): Array<any> => {
      if (!contents) return [];
      if (typeof contents === 'string') return [{ text: contents }];
      if (Array.isArray(contents)) return contents;
      return [contents];
    };

    const toImageUrlObject = (inlineData: { mimeType: string; data: string }) => ({
      type: 'image_url',
      image_url: { url: `data:${inlineData.mimeType};base64,${inlineData.data}` }
    });

    const inlineDataToBlob = async (inlineData: { mimeType: string; data: string }) => {
      const raw = inlineData?.data || '';
      const mime = inlineData?.mimeType || 'application/octet-stream';
      const dataUrl = raw.startsWith('data:') ? raw : `data:${mime};base64,${raw}`;
      const resp = await fetch(dataUrl);
      return await resp.blob();
    };

    const extractOperationId = (data: any): string => {
      const candidates = [
        data?.task_id,
        data?.taskId,
        data?.job_id,
        data?.operation_id,
        data?.id,
        data?.request_id,
        data?.uuid,
        data?.result?.id,
        data?.data?.id,
        data?.data?.task_id,
        Array.isArray(data?.ids) ? data?.ids?.[0] : undefined,
        data?.task?.id,
        data?.operation?.id
      ];
      let id = candidates.find(v => typeof v === 'string' && v.length > 0) || '';
      if (!id && typeof data?.location === 'string') {
        const m = data.location.match(/generations\/?([A-Za-z0-9_-]+)/);
        if (m && m[1]) id = m[1];
      }
      return id;
    };

    const contentsToMessages = (contents: Array<any>) => {
      const contentArray: Array<any> = [];
      for (const part of contents) {
        if (part?.text) contentArray.push({ type: 'text', text: String(part.text) });
        if (part?.inlineData?.data && part?.inlineData?.mimeType) contentArray.push(toImageUrlObject(part.inlineData));
      }
      return [{ role: 'user', content: contentArray.length > 0 ? contentArray : [{ type: 'text', text: '' }] }];
    };

    const imageGenResponseToInlineData = (res: any): GenerateContentResponse => {
      const b64 = res?.data?.[0]?.b64_json || res?.data?.[0]?.b64 || '';
      const mime = 'image/png';
      return {
        candidates: [{ content: { parts: [{ inlineData: { mimeType: mime, data: b64 } }] } }]
      };
    };

    const models = {
      generateContent: async ({ model, contents, config }: any): Promise<GenerateContentResponse> => {
        const parts = normalizeContents(contents);
        const hasImageInput = parts.some(p => p?.inlineData?.data);

        if (model === MODEL_V3_IMAGE) {
          const promptText = parts.filter(p => p?.text).map(p => String(p.text)).join('\n');
          const aspect = (config?.imageConfig?.aspectRatio) || '1:1';
          const size = RATIO_TO_SIZE[aspect] || RATIO_TO_SIZE['1:1'];

          if (hasImageInput) {
            const firstImage = parts.find(p => p?.inlineData?.data)?.inlineData;
            const fd = new FormData();
            if (firstImage?.data && firstImage?.mimeType) {
              const blob = await inlineDataToBlob(firstImage);
              fd.append('image', blob, 'image');
            }
            if (promptText) fd.append('prompt', promptText);
            fd.append('model', 'nano-banana-2-2k');
            fd.append('size', size);
            fd.append('response_format', 'b64_json');
            fd.append('n', '1');
            const resp = await fetch(`${GATEWAY_BASE_URL}/v1/images/edits`, { method: 'POST', headers: authImage as any, body: fd });
            const data = await resp.json();
            return imageGenResponseToInlineData(data);
          } else {
            let body: any = { model: 'nano-banana-2-2k', prompt: promptText, size, response_format: 'b64_json', n: 1 };
            let resp = await fetch(`${GATEWAY_BASE_URL}/v1/images/generations`, { method: 'POST', headers: { ...authImage, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            let data = await resp.json();
            let out = await imageGenResponseToInlineData(data);
            const b64 = out?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
            if (!b64) {
              body = { model: 'nano-banana-2-2k', prompt: promptText, size: RATIO_TO_SIZE['1:1'], response_format: 'b64_json', n: 1 };
              resp = await fetch(`${GATEWAY_BASE_URL}/v1/images/generations`, { method: 'POST', headers: { ...authImage, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
              data = await resp.json();
              out = await imageGenResponseToInlineData(data);
            }
            return out;
          }
        }

        const messages = contentsToMessages(parts);
        const body: any = { model: 'gemini-3-pro-preview', messages };
        if (config?.responseMimeType === 'application/json') body.response_format = { type: 'json_object' };
        const resp = await fetch(`${GATEWAY_BASE_URL}/v1/chat/completions`, { method: 'POST', headers: { ...authText, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await resp.json();
        const text = data?.choices?.[0]?.message?.content || '';
        return { text };
      },

      generateVideos: async ({ model, prompt, image, config }: any): Promise<any> => {
        const aspect = (config?.aspectRatio) || '16:9';
        const selectedModel = model || 'veo3.1-pro';
        
        const payload: any = { 
            model: selectedModel, 
            prompt, 
            aspect_ratio: aspect,
            enhance_prompt: false 
        };

        const images = [];
        if (image?.imageBytes) {
             const mime = image.mimeType || 'image/jpeg';
             const dataUrl = `data:${mime};base64,${image.imageBytes}`;
             images.push(dataUrl);
        }

        if (config?.lastFrame?.imageBytes) {
             const mime = config.lastFrame.mimeType || 'image/jpeg';
             const dataUrl = `data:${mime};base64,${config.lastFrame.imageBytes}`;
             images.push(dataUrl);
        }
        
        // Constraint: veo3-pro-frames only supports 1 image (start frame)
        if (selectedModel === 'veo3-pro-frames' && images.length > 1) {
            images.splice(1);
        }

        if (images.length > 0) {
            payload.images = images;
        }

        const resp = await fetch(`${GATEWAY_BASE_URL}/v2/videos/generations`, { method: 'POST', headers: { ...authVideo, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await resp.json();
        const name = extractOperationId(data);
        const uri = data?.result_url || data?.video_url || data?.uri || data?.result?.url || data?.output_url || '';
        const op = { name, done: !!uri, uri };
        return op;
      }
    };

    const operations = {
      getVideosOperation: async ({ operation }: any): Promise<any> => {
        const id = operation?.name || operation?.id || operation?.task_id || operation?.taskId || operation?.job_id || operation?.operation_id || '';
        if (!id) {
          const uri0 = operation?.uri || '';
          return { done: !!uri0, response: { generatedVideos: [{ video: { uri: uri0 } }] } };
        }
        let url = `${GATEWAY_BASE_URL}/v2/videos/generations/${id}`;
        let resp = await fetch(url, { headers: authVideo });
        if (!resp.ok && resp.status === 404) {
          url = `${GATEWAY_BASE_URL}/v2/videos/generations?id=${encodeURIComponent(id)}`;
          resp = await fetch(url, { headers: authVideo });
        }
        const data = await resp.json();
        const status = data?.status || '';
        const done = status === 'SUCCESS' || status === 'FAILURE';
        
        let error = undefined;
        if (status === 'FAILURE') {
            error = { message: data?.fail_reason || "Veo Generation Failed" };
        }

        const uri = data?.data?.output || data?.result_url || data?.video_url || data?.uri || '';
        return { done, error, response: { generatedVideos: [{ video: { uri } }] } };
      }
    };

    return { models, operations };
  };

  const isCriticalError = (error: any) => {
      let msg = "";
      if (error instanceof Error) {
          msg = error.message;
      } else if (typeof error === 'string') {
          msg = error;
      } else {
          try {
            msg = JSON.stringify(error);
          } catch (e) { msg = ""; }
      }
      const lower = msg.toLowerCase();
      return lower.includes('per_day') || 
             lower.includes('limit: 0') || 
             lower.includes('api_key_invalid') || 
             lower.includes('billing') ||
             (lower.includes('429') && lower.includes('resource_exhausted'));
  }

  const parseAIResponse = (text: string) => {
      if (!text) return {};
      let cleanText = text;
      cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');
      
      const first = cleanText.indexOf('{');
      const last = cleanText.lastIndexOf('}');
      
      if (first !== -1 && last !== -1 && last > first) {
          cleanText = cleanText.substring(first, last + 1);
      }
      
      try {
          return JSON.parse(cleanText);
      } catch (e) {
          console.error("JSON Parse Error", e, "Raw Text:", text);
          throw new Error("Failed to parse AI response: " + String(e));
      }
  };

  async function retryOperation<T extends unknown>(operation: () => Promise<T>, retries = 5, delay = 4000): Promise<T> {
      try {
          const res = await operation();
          if (res instanceof Response) {
              if (!res.ok) {
                   if (res.status === 401 || res.status === 403) throw new Error(`Proxy Auth Error: ${res.status}`);
                   if (res.status === 503 || res.status === 429 || res.status === 500) throw new Error(`Server Busy: ${res.status}`);
                   throw new Error(`HTTP Error: ${res.status}`);
              }
          }
          return res;
      } catch (error: any) {
          if (isCriticalError(error)) throw error; 
          
          let msg = "";
           if (error instanceof Error) msg = error.message;
           else if (typeof error === 'string') msg = error;
           else try { msg = JSON.stringify(error); } catch(e) { msg = "Unknown"; }
          
          const isOverloaded = msg.includes('503') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Failed to fetch') || msg.includes('500') || msg.includes('Internal Server Error') || msg.includes('INTERNAL') || msg.includes('Server Busy');
          
          if (retries > 0 && isOverloaded) {
              let waitTime = delay;
              const match = msg.match(/retry in ([\d.]+)s/);
              if (match && match[1]) {
                  const retrySeconds = parseFloat(match[1]);
                  waitTime = Math.ceil(retrySeconds * 1000) + 1000;
              }
              await new Promise(resolve => setTimeout(resolve, waitTime));
              return retryOperation(operation, retries - 1, match ? waitTime : delay * 1.5); 
          }
          throw error;
      }
  }

  const handleAPIError = (e: any) => {
    let msg = "API Error";
    try {
        if (e instanceof Error) msg = e.message;
        else if (typeof e === 'string') msg = e;
        else msg = JSON.stringify(e);
    } catch(err) {
        msg = "Unknown Error Object";
    }
    console.error("API Error:", msg);
    
    const lowerMsg = msg.toLowerCase();

    if (lowerMsg.includes('limit: 0') || (lowerMsg.includes('429') && lowerMsg.includes('resource_exhausted'))) {
        setShowApiKeyDialog(true);
        return;
    }
    
    if (lowerMsg.includes('per_day')) {
        alert("⚠️ Daily Quota Exceeded. Switch API Key.");
        setShowApiKeyDialog(true);
    } else if (lowerMsg.includes('requested entity was not found') || lowerMsg.includes('api_key_invalid')) {
      setShowApiKeyDialog(true);
    } else if (lowerMsg.includes('proxy auth error') || lowerMsg.includes('401')) {
        alert("⚠️ Video Service Error: Unauthorized.");
    } else {
        alert("⚠️ Error: " + msg.substring(0, 150));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 将 dataURL 或远程图片转换为 { mimeType, imageBytes }，供视频生成使用
  const toImageBytes = async (url?: string): Promise<{ mimeType: string; imageBytes: string } | null> => {
    if (!url) return null;
    if (url.startsWith('data:')) {
        const match = url.match(/^data:([^;]+);base64,(.+)$/);
        if (match && match[1] && match[2]) {
            return { mimeType: match[1], imageBytes: match[2] };
        }
        return null;
    }
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const blob = await res.blob();
        const buffer = await blob.arrayBuffer();
        const bytes = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        return { mimeType: blob.type || 'image/jpeg', imageBytes: bytes };
    } catch (e) {
        console.warn("toImageBytes fetch error", e);
        return null;
    }
  };

  const generateVeoClip = async (faceId: string, panelId: string) => {
      const face = comicFaces.find(f => f.id === faceId); if (!face) return;
      const panel = face.panels.find(p => p.id === panelId); if (!panel || !panel.imageUrl) return;
      
      setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, panels: f.panels.map(p => p.id === panelId ? { ...p, videoStatus: 'generating' } : p) } : f));
      
      try {
          const ai = getAI();
          
          const config: any = {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: selectedAspectRatio === '9:16' ? '9:16' : '16:9'
          };

          const startImage = await toImageBytes(panel.imageUrl);
          if (!startImage) throw new Error("Invalid start image for video generation");

          const lastFrameImage = panel.lastFrameUrl ? await toImageBytes(panel.lastFrameUrl) : null;
          if (lastFrameImage) {
              config.lastFrame = lastFrameImage;
          }

          let operation = await ai.models.generateVideos({
              model: selectedVideoModel,
              prompt: `${panel.scene}`,
              image: startImage,
              config: config
          });

          let videoUri = "";
          let retries = 0;
          while (!operation.done) {
              await new Promise(resolve => setTimeout(resolve, 5000));
              operation = await ai.operations.getVideosOperation({operation: operation});
              retries++;
              if (retries > 60) throw new Error("Video generation timed out");
          }
          
          if (operation.error) {
             throw new Error("Veo Generation Error: " + (operation.error.message || JSON.stringify(operation.error)));
          }

          videoUri = operation.response?.generatedVideos?.[0]?.video?.uri || "";

          if (videoUri) {
              const downloadUrl = `${videoUri}&key=${process.env.API_KEY}`;
              const res = await fetch(downloadUrl);
              if (!res.ok) throw new Error("Failed to download video bytes");
              const blob = await res.blob();
              const objectUrl = URL.createObjectURL(blob);
              
              setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, panels: f.panels.map(p => p.id === panelId ? { ...p, videoStatus: 'done', videoUrl: objectUrl, videoVolume: false } : p) } : f));
              saveProject();
          } else { 
              throw new Error("No video returned"); 
          }
      } catch (e: any) {
          console.error("Veo Error:", e);
          if (isCriticalError(e)) handleAPIError(e); 
          else alert(e.message);
          setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, panels: f.panels.map(p => p.id === panelId ? { ...p, videoStatus: 'error' } : p) } : f));
      }
  };
  const togglePanelAudio = (faceId: string, panelId: string) => { setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, panels: f.panels.map(p => p.id === panelId ? { ...p, videoVolume: !p.videoVolume } : p) } : f)); };

  const handleDeleteScene = (faceId: string) => {
      setComicFaces(prev => prev.filter(f => f.id !== faceId));
  };

  const handleDeletePanelImage = (faceId: string, panelId: string, type: 'start' | 'end') => {
      setComicFaces(prev => prev.map(f => {
          if (f.id !== faceId) return f;
          return {
              ...f,
              panels: f.panels.map(p => {
                  if (p.id !== panelId) return p;
                  const updates: Partial<ComicPanelData> = {};
                  if (type === 'start') {
                      updates.imageUrl = undefined;
                      updates.videoUrl = undefined;
                      updates.videoStatus = 'idle';
                  } else if (type === 'end') {
                      updates.lastFrameUrl = undefined;
                  }
                  return { ...p, ...updates };
              })
          };
      }));
  };

  // --- STYLE REVERSE ENGINEERING (AUTO-CONSISTENCY) ---
  const analyzeHeroStyle = async (): Promise<string> => {
      if (heroesRef.current.length === 0) return "";
      
      const ai = getAI();
      const hero = heroesRef.current[0];
      const prompt = `
      Analyze the ART STYLE of this character image.
      
      STEP 1: Classify into one of these 3 STRICT CATEGORIES:
      - "REAL" (if it looks like a real human photo, photorealistic, cinematic)
      - "2D" (if it looks like 2D anime, cartoon, flat illustration, drawing)
      - "3D" (if it looks like 3D CGI, Pixar, Game Render, Clay, 3D model)

      STEP 2: Generate 5-10 precise keywords describing the style.

      Return JSON ONLY: { "category": "REAL" | "2D" | "3D", "keywords": "string" }
      `;
      
      try {
          const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
              model: MODEL_VISION,
              contents: [
                  { inlineData: { mimeType: 'image/jpeg', data: hero.base64 } },
                  { text: prompt }
              ],
              config: { responseMimeType: 'application/json' }
          }));
          const data = JSON.parse(res.text || "{}");
          
          const cat = data.category ? data.category.toUpperCase() : "UNKNOWN";
          if (['REAL', '2D', '3D'].includes(cat)) {
              detectedVisualCategoryRef.current = cat as any;
          } else {
              detectedVisualCategoryRef.current = 'REAL'; 
          }
          
          const style = data.keywords || "";
          return style;
      } catch(e) {
          console.warn("Style Analysis Failed", e);
          detectedVisualCategoryRef.current = 'REAL';
          return "";
      }
  };

  const handleLaunch = async () => {
    if (!await validateApiKey()) return;
    setIsTransitioning(true);
    setLoadingStatus("Analyzing Vision & Style...");
    setLoadingProgress(10);
    
    try {
        const detectedStyle = await analyzeHeroStyle();
        detectedVisualBaseRef.current = detectedStyle;
        
        setLoadingStatus("Planning Script & Storyboard...");
        setLoadingProgress(30);
        const { script, actualCount } = await planFullScript(selectedPageCount);
        
        if (script.length === 0) {
            throw new Error("Script Generation Failed (Non-Critical)");
        }

        setLoadingProgress(50);
        const newFaces: ComicFace[] = [];

        const globalSceneData: SceneMetadata = {
             setting: "Key Visual / Poster Background",
             lighting: "Dramatic Studio Lighting",
             costume_rule: "Signature Outfit",
             mood: "Epic, Cinematic",
        };
        
        newFaces.push({ 
            id: 'cover', 
            type: 'cover', 
            layout: 'single', 
            sceneData: globalSceneData, 
            panels: [{
                id: 'cover-p1',
                index: 0,
                scene: `Movie Poster for ${selectedGenre} movie. Title: ${customPremise.substring(0,20)}... . High quality, main character featured.`,
                focus_char: heroesRef.current.length > 0 ? 'hero-0' : 'none', 
                isLoading: false,
                imageUrl: ''
            }], 
            choices: [] 
        });
        
        script.forEach(page => {
            const faceId = `scene-${page.pageIndex}-${Date.now()}`;
            newFaces.push({
                id: faceId,
                type: 'story',
                pageIndex: page.pageIndex,
                layout: page.layout,
                sceneData: page.sceneMetadata,
                panels: page.panels.map((p, idx) => ({
                    id: `${faceId}-p${idx}`,
                    index: idx,
                    scene: p.scene,
                    caption: p.caption,
                    dialogue: p.dialogue,
                    focus_char: p.focus_char,
                    camera: p.camera,
                    lighting: p.lighting,
                    sound_fx: p.sound_fx,
                    imageUrl: '',
                    isLoading: false,
                    videoVolume: false
                })),
                choices: page.choices || [],
                isLoading: false,
                isVisualized: false
            });
        });

        newFaces.push({ 
            id: 'back_cover', 
            type: 'back_cover', 
            layout: 'single', 
            sceneData: { ...globalSceneData, setting: "Black screen or abstract background", mood: "Quiet, Final" }, 
            panels: [{
                id: 'back_cover-p1',
                index: 0,
                scene: "End Title Card. Cinematic Typography. Credits. Consistent Art Style.",
                focus_char: 'none',
                isLoading: false,
                imageUrl: ''
            }], 
            choices: [] 
        });

        setComicFaces(newFaces);
        setIsStarted(true);
        setShowSetup(false);
        setLoadingProgress(100);
        
    } catch (e: any) {
        console.error("Launch Error", e);
        handleAPIError(e);
    } finally {
        setIsTransitioning(false);
    }
  };

  const planFullScript = async (requestedLimit: number): Promise<{ script: ScriptPage[], actualCount: number }> => {
      if (heroesRef.current.length === 0) throw new Error("No Heroes");
      let totalScenes = requestedLimit === 0 ? 6 : requestedLimit; 

      const castList = heroesRef.current.map((h, i) => `HERO-${i} (${h.name || 'Protag'})`).join('; ');
      const supportList = supportsRef.current.map((s, i) => `SUPPORT-${i} (${s.name || 'Extra'})`).join('; ');
      const itemList = itemsRef.current.map((item, i) => `ITEM-${i} (${item.name})`).join('; ');
      const locList = locsRef.current.map((loc, i) => `LOC-${i} (${loc.name})`).join('; ');

      let targetLangName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage;
      if (selectedLanguage.includes('zh') || selectedLanguage.includes('CN')) targetLangName = "Simplified Chinese (简体中文)";

      const compositeStyle = `${selectedDirector} | ${selectedArtStyle} | ${selectedRefWork}`;
      const agent = getAgentSystemInstruction(selectedGenre);

      let styleConstraint = "";
      if (detectedVisualCategoryRef.current === 'REAL') styleConstraint = "CONSTRAINT: The film features REAL ACTORS. All scene descriptions, costumes, and settings MUST be described as 'Real World', 'Photorealistic', 'Cinematic Photography'. Avoid cartoon/anime terms.";
      if (detectedVisualCategoryRef.current === '2D') styleConstraint = "CONSTRAINT: The film is a 2D ANIME/ANIMATION. All scene descriptions MUST emphasize '2D Anime Style', 'Flat Illustration', 'Cel Shading', 'Hand Drawn'. Avoid realistic terms.";
      if (detectedVisualCategoryRef.current === '3D') styleConstraint = "CONSTRAINT: The film is a 3D CGI/GAME ANIMATION. All scene descriptions MUST emphasize '3D Render', 'Unreal Engine 5', 'Volumetric Lighting', 'CGI'.";

      const prompt = `
      ROLE: ${agent.role}
      TASK: ${agent.task_desc}
      PROJECT: ${selectedGenre}. PREMISE: ${customPremise}. 
      ARTISTIC DIRECTION: ${compositeStyle} ${customStylePrompt}.
      VISUAL STYLE ENFORCEMENT: ${detectedVisualBaseRef.current || ""}
      STYLE CATEGORY: ${detectedVisualCategoryRef.current}
      ${styleConstraint}
      ${agent.output_advice}
      *** IMPORTANT: OUTPUT EVERYTHING IN ${targetLangName}. 
      ASSETS: CAST: ${castList}, ${supportList}. PROPS: ${itemList}. LOCATIONS: ${locList}.
      WORKFLOW (Copy & Transcend):
      1. [REFERENCE] Identify 3 masterpieces (2015-2025).
      2. [TRANSCEND] Avoid clichés. Propose a unique twist.
      3. [SCENES] Create ${totalScenes} Scenes following: ${agent.structure_guide}
         - **DYNAMIC VIDEO PROMPTS**: For 'scene' description, describe movement: "Start frame shows [X], then camera moves [Y], action evolves to [Z]."
         - SHOT COUNT: 3-8 shots per scene.
      OUTPUT JSON: {
        "bible": { "references": [], "strategy": "..." },
        "scenes": [ { "sceneIndex": 1, "metadata": { "setting": "...", "lighting": "...", "costume_rule": "...", "mood": "..." }, 
        "shots": [ { "scene": "Start frame: Hero walks in... then looks up...", "caption": "...", "dialogue": "...", "focus_char": "hero-0", "camera": "...", "lighting": "...", "sound_fx": "..." } ] } ]
      }
      `;

      try {
          const ai = getAI();
          const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ model: MODEL_DIRECTOR, contents: prompt, config: { responseMimeType: 'application/json' } }));
          const data = parseAIResponse(res.text || "{}");
          const scenes = data.scenes || [];
          
          const script: ScriptPage[] = scenes.map((s: any, i: number) => ({
              pageIndex: i + 1, layout: 'single', sceneMetadata: s.metadata,
              panels: s.shots.map((shot: any) => ({
                  scene: shot.scene, caption: shot.caption, dialogue: shot.dialogue, focus_char: shot.focus_char ? shot.focus_char.toLowerCase() : 'none', camera: shot.camera, lighting: shot.lighting, sound_fx: shot.sound_fx
              }))
          }));
          if (data.bible?.references) setMasterpieceRef(`${data.bible.references[0]} (Inspired)`);
          return { script, actualCount: script.length };
      } catch (e) { 
          if (isCriticalError(e)) throw e; 
          console.error("Plan Script Error", e);
          handleAPIError(e); 
          return { script: [], actualCount: 0 }; 
      }
  };

  const generateSceneAnchors = async (sceneMeta: SceneMetadata, faceId: string, panels: ComicPanelData[]) => {
      const ai = getAI();
      const heroIndices = new Set<number>();
      panels.forEach(p => { if (p.focus_char && p.focus_char.startsWith('hero-')) heroIndices.add(parseInt(p.focus_char.split('-')[1])); });
      let stylePrefix = "";
      if (detectedVisualCategoryRef.current === 'REAL') stylePrefix = "Real photo, photorealistic, 8k. ";
      if (detectedVisualCategoryRef.current === '2D') stylePrefix = "2D Anime character sheet, flat color, cel shaded. ";
      if (detectedVisualCategoryRef.current === '3D') stylePrefix = "3D Render character sheet, cgi, unreal engine 5. ";
      if (heroIndices.size > 0 && sceneMeta.costume_rule) {
          let prompt = ""; const contents: any[] = [];
          if (heroIndices.size === 1) {
              const idx = Array.from(heroIndices)[0]; const hero = heroesRef.current[idx];
              prompt = `${stylePrefix} Full body Character Sheet. Identity: ${hero.name}. Costume: ${sceneMeta.costume_rule}. Style: ${selectedArtStyle}. Flat background.`;
              contents.push({ text: "Keep Identity:" }, { inlineData: { mimeType: 'image/jpeg', data: hero.base64 } });
          } else {
              prompt = `${stylePrefix} Group Shot. Characters: ${Array.from(heroIndices).map(i => heroesRef.current[i].name).join(', ')}. Costume: ${sceneMeta.costume_rule}. Style: ${selectedArtStyle}.`;
              Array.from(heroIndices).forEach(i => { contents.push({ text: `HERO-${i} Ref:` }, { inlineData: { mimeType: 'image/jpeg', data: heroesRef.current[i].base64 } }); });
          }
          contents.push({ text: prompt });
          try {
             const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ model: MODEL_V3_IMAGE, contents: contents, config: { imageConfig: { aspectRatio: '16:9' } } }));
             const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
             if(part?.inlineData?.data) sceneMeta.anchor_costume_url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          } catch(e) {}
      }
      if (sceneMeta.setting && sceneMeta.setting !== 'None') {
          const prompt = `${stylePrefix} Empty Set, Location Concept Art. ${sceneMeta.setting}. Lighting: ${sceneMeta.lighting}. Style: ${selectedArtStyle}. No people.`;
          try {
             const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ model: MODEL_V3_IMAGE, contents: [{ text: prompt }], config: { imageConfig: { aspectRatio: '16:9' } } }));
             const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
             if(part?.inlineData?.data) sceneMeta.anchor_environment_url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          } catch(e) {}
      }
      setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, sceneData: sceneMeta } : f));
  };
  
  const handleRegenerateSingleAnchor = async (faceId: string, type: 'costume' | 'env') => {
      const face = comicFaces.find(f => f.id === faceId); 
      if (!face || !face.sceneData) return;
      const ai = getAI();
      const sceneMeta = { ...face.sceneData };
      const heroIndices = new Set<number>();
      face.panels.forEach(p => { if (p.focus_char && p.focus_char.startsWith('hero-')) heroIndices.add(parseInt(p.focus_char.split('-')[1])); });
      let stylePrefix = "";
      if (detectedVisualCategoryRef.current === 'REAL') stylePrefix = "Real photo, photorealistic, 8k. ";
      if (detectedVisualCategoryRef.current === '2D') stylePrefix = "2D Anime character sheet, flat color, cel shaded. ";
      if (detectedVisualCategoryRef.current === '3D') stylePrefix = "3D Render character sheet, cgi, unreal engine 5. ";
      try {
          if (type === 'costume' && heroIndices.size > 0 && sceneMeta.costume_rule) {
              let prompt = ""; const contents: any[] = [];
              if (heroIndices.size === 1) {
                  const idx = Array.from(heroIndices)[0]; const hero = heroesRef.current[idx];
                  prompt = `${stylePrefix} Full body Character Sheet. Identity: ${hero.name}. Costume: ${sceneMeta.costume_rule}. Style: ${selectedArtStyle}. Flat background.`;
                  contents.push({ text: "Keep Identity:" }, { inlineData: { mimeType: 'image/jpeg', data: hero.base64 } });
              } else {
                  prompt = `${stylePrefix} Group Shot. Characters: ${Array.from(heroIndices).map(i => heroesRef.current[i].name).join(', ')}. Costume: ${sceneMeta.costume_rule}. Style: ${selectedArtStyle}.`;
                  Array.from(heroIndices).forEach(i => { contents.push({ text: `HERO-${i} Ref:` }, { inlineData: { mimeType: 'image/jpeg', data: heroesRef.current[i].base64 } }); });
              }
              contents.push({ text: prompt });
              const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ model: MODEL_V3_IMAGE, contents: contents, config: { imageConfig: { aspectRatio: '16:9' } } }));
              const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
              if(part?.inlineData?.data) sceneMeta.anchor_costume_url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          } else if (type === 'env' && sceneMeta.setting && sceneMeta.setting !== 'None') {
              const prompt = `${stylePrefix} Empty Set, Location Concept Art. ${sceneMeta.setting}. Lighting: ${sceneMeta.lighting}. Style: ${selectedArtStyle}. No people.`;
              const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ model: MODEL_V3_IMAGE, contents: [{ text: prompt }], config: { imageConfig: { aspectRatio: '16:9' } } }));
              const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
              if(part?.inlineData?.data) sceneMeta.anchor_environment_url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
          setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, sceneData: sceneMeta } : f));
      } catch (e) {
          handleAPIError(e);
      }
  };

  const generatePanelImage = async (panel: ComicPanelData, sceneMeta?: SceneMetadata): Promise<{ url: string, prompt: string }> => {
    const ai = getAI(); const contents: any[] = []; let charPrompt = "";
    if (panel.focus_char && panel.focus_char !== 'none') {
        let persona: Persona | undefined; let prefix = "";
        if (panel.focus_char.startsWith('hero-')) { const idx = parseInt(panel.focus_char.split('-')[1]); persona = heroesRef.current[idx]; prefix = `HERO-${idx}`; } 
        else if (panel.focus_char.startsWith('support-')) { const idx = parseInt(panel.focus_char.split('-')[1]); persona = supportsRef.current[idx]; prefix = `SUPPORT-${idx}`; }
        if (persona) {
            if (sceneMeta?.anchor_costume_url && prefix.includes('HERO')) { contents.push({ text: "COSTUME REF:" }, { inlineData: { mimeType: 'image/jpeg', data: sceneMeta.anchor_costume_url.split(',')[1] } }); }
            contents.push({ text: "IDENTITY REF:" }, { inlineData: { mimeType: 'image/jpeg', data: persona.base64 } });
            charPrompt = `IDENTITY: ${persona.name}. `;
        }
    }
    if (sceneMeta?.anchor_environment_url) { contents.push({ text: "LOCATION REF:" }, { inlineData: { mimeType: 'image/jpeg', data: sceneMeta.anchor_environment_url.split(',')[1] } }); }
    if (sceneMeta?.extra_anchors) { sceneMeta.extra_anchors.forEach((b64, i) => { contents.push({ text: `PROP REF ${i}:` }, { inlineData: { mimeType: 'image/jpeg', data: b64.split(',')[1] } }); }); charPrompt += " Include props."; }
    let visualBase = detectedVisualBaseRef.current || getVisualBaseInstruction(selectedGenre);
    if (detectedVisualBaseRef.current) visualBase = `STRICT STYLE ENFORCEMENT: ${detectedVisualBaseRef.current}. ` + visualBase;
    let categoryPrefix = "";
    let negativePrompt = "text, watermark, bad anatomy, blur";
    if (detectedVisualCategoryRef.current === 'REAL') {
        categoryPrefix = "PHOTOREALISTIC, 8k, RAW photo, real life, cinematic lighting. ";
        negativePrompt += ", anime, cartoon, illustration, drawing, 3d render, cgi, sketch, painting";
    } else if (detectedVisualCategoryRef.current === '2D') {
        categoryPrefix = "2D ANIME STYLE, flat illustration, cel shaded, hand drawn, 2d animation. ";
        negativePrompt += ", photorealistic, real photo, 3d render, cgi, unity, unreal engine, photograph";
    } else if (detectedVisualCategoryRef.current === '3D') {
        categoryPrefix = "3D RENDER, Unreal Engine 5, Octane Render, CGI, 3d character. ";
        negativePrompt += ", 2d, flat illustration, sketch, drawing, anime, japanese anime, photograph, real person";
    }
    const compositeStyle = `${selectedDirector} | ${selectedArtStyle} | ${selectedRefWork}`;
    let promptText = `[VISUAL BASE]: ${categoryPrefix} ${visualBase} [CONTENT]: SETTING: ${sceneMeta?.setting}. ACTION: ${panel.scene}. CHARACTERS: ${charPrompt}. [STYLE]: CAMERA: ${panel.camera}. LIGHTING: ${panel.lighting}. ART DIRECTION: ${compositeStyle} ${customStylePrompt}. NEGATIVE: ${negativePrompt}.`;
    contents.push({ text: promptText });
    try {
        const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ model: MODEL_V3_IMAGE, contents: contents, config: { imageConfig: { aspectRatio: isMV(selectedGenre) ? selectedAspectRatio : '1:1' } } }));
        const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        return { url: part?.inlineData?.data ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : '', prompt: promptText };
    } catch (e) { if (isCriticalError(e)) throw e; handleAPIError(e); return { url: '', prompt: promptText }; }
  };

  const generateLastFrameImage = async (panel: ComicPanelData, sceneMeta?: SceneMetadata, overrideDesc?: string): Promise<{ url: string, prompt: string }> => {
      if(!panel.imageUrl) return { url: '', prompt: '' };
      const ai = getAI();
      const contents: any[] = [];
      const compositeStyle = `${selectedDirector} | ${selectedArtStyle}`;
      contents.push({ inlineData: { mimeType: 'image/jpeg', data: panel.imageUrl.split(',')[1] } });
      const actionDesc = overrideDesc || panel.scene;
      const promptText = `Final frame of the shot. ACTION END STATE: ${actionDesc}. STYLE: ${compositeStyle}. Maintain same characters and environment.`;
      contents.push({ text: promptText });
      try {
          const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ model: MODEL_V3_IMAGE, contents: contents, config: { imageConfig: { aspectRatio: isMV(selectedGenre) ? selectedAspectRatio : '1:1' } } }));
          const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
          return { url: part?.inlineData?.data ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : '', prompt: promptText };
      } catch(e) { handleAPIError(e); return { url: '', prompt: ''}; }
  };

  const handleGenerateSceneImages = async (faceId: string) => {
      const face = comicFaces.find(f => f.id === faceId); if (!face) return;
      setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, isLoading: true, panels: f.panels.map(p => ({ ...p, isLoading: true })) } : f));
      try {
          if (face.sceneData) await generateSceneAnchors(face.sceneData, faceId, face.panels);
          const BATCH_SIZE = 8; const chunks = [];
          for (let i = 0; i < face.panels.length; i += BATCH_SIZE) chunks.push(face.panels.slice(i, i + BATCH_SIZE));
          for (const chunk of chunks) {
              await Promise.all(chunk.map(async (panel) => {
                  const result = await generatePanelImage(panel, face.sceneData);
                  setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, panels: f.panels.map(p => p.id === panel.id ? { ...p, imageUrl: result.url, prompt: result.prompt, isLoading: false } : p) } : f));
              }));
              await new Promise(resolve => setTimeout(resolve, 500));
          }
          setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, isVisualized: true, isLoading: false } : f));
          saveProject();
      } catch (e) { handleAPIError(e); setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, isLoading: false } : f)); }
  };

  const handleRegeneratePanel = async (faceId: string, panelId: string) => {
      const face = comicFaces.find(f => f.id === faceId); if(!face) return; const panel = face.panels.find(p => p.id === panelId); if(!panel) return;
      setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, panels: f.panels.map(p => p.id === panelId ? { ...p, isLoading: true } : p) } : f));
      const result = await generatePanelImage(panel, face.sceneData);
      setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, panels: f.panels.map(p => p.id === panelId ? { ...p, imageUrl: result.url, prompt: result.prompt, isLoading: false } : p) } : f));
  };
  
  const handleUpdatePanel = (faceId: string, panelId: string, field: 'scene' | 'prompt' | 'lighting' | 'sound_fx' | 'camera', value: string) => {
      setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, panels: f.panels.map(p => p.id === panelId ? { ...p, [field]: value } : p) } : f));
  };

  const handleUpdateAnchor = (faceId: string, type: 'costume' | 'env', file?: File) => {
      if (!file) return; fileToBase64(file).then(base64 => {
          setComicFaces(prev => prev.map(f => {
              if (f.id !== faceId || !f.sceneData) return f;
              const newData = { ...f.sceneData };
              if (type === 'costume') newData.anchor_costume_url = `data:image/jpeg;base64,${base64}`; else newData.anchor_environment_url = `data:image/jpeg;base64,${base64}`;
              return { ...f, sceneData: newData };
          }));
      });
  };
  const handleUpdateExtraAnchor = async (faceId: string, file: File) => {
      try { const base64 = await fileToBase64(file); const fullBase64 = `data:image/jpeg;base64,${base64}`;
          setComicFaces(prev => prev.map(f => { if (f.id !== faceId || !f.sceneData) return f; const currentExtras = f.sceneData.extra_anchors || []; if (currentExtras.length >= 5) return f; return { ...f, sceneData: { ...f.sceneData!, extra_anchors: [...currentExtras, fullBase64] } }; }));
      } catch(e) {}
  };
  const handleUpdatePersonaName = (type: 'hero' | 'support', id: string, newName: string) => { if (type === 'hero') updateHeroes(heroesRef.current.map(p => p.id === id ? { ...p, name: newName } : p)); else updateSupports(supportsRef.current.map(p => p.id === id ? { ...p, name: newName } : p)); };

  const handleRewriteScene = async (faceId: string) => {
      const face = comicFaces.find(f => f.id === faceId); 
      if (!face) return;
      setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, isLoading: true } : f));
      const ai = getAI();
      let targetLangName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage;
      if (selectedLanguage.includes('zh') || selectedLanguage.includes('CN')) targetLangName = "Simplified Chinese (简体中文)";
      const prompt = `
      ROLE: Script Editor. 
      TASK: Rewrite the scene description and dialogue for Scene ${face.pageIndex}.
      CONTEXT: Premise: ${customPremise}. Genre: ${selectedGenre}.
      CHARACTERS: ${heroesRef.current.map(h=>h.name).join(', ')}.
      REQUIREMENT: Make it more dramatic/creative. Keep same character count.
      OUTPUT LANGUAGE: ${targetLangName} (STRICTLY - DO NOT USE ENGLISH unless requested).
      OUTPUT JSON: { "metadata": { "setting": "...", "mood": "..." }, "shots": [ { "scene": "...", "dialogue": "...", "camera": "..." } ... ] }
      `;
      try {
          const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ 
              model: MODEL_DIRECTOR, contents: prompt, config: { responseMimeType: 'application/json' } 
          }));
          const data = parseAIResponse(res.text || "{}");
          if (data.shots && Array.isArray(data.shots)) {
             const newPanels: ComicPanelData[] = data.shots.map((shot: any, idx: number) => ({
                 id: `scene-${face.pageIndex}-p${idx}-${Date.now()}`,
                 index: idx,
                 scene: shot.scene,
                 dialogue: shot.dialogue,
                 focus_char: face.panels[idx]?.focus_char || 'none', 
                 camera: shot.camera,
                 lighting: face.panels[idx]?.lighting || "",
                 sound_fx: face.panels[idx]?.sound_fx || "",
                 isLoading: false, 
                 imageUrl: '', 
                 videoVolume: false
             }));
             setComicFaces(prev => prev.map(f => f.id === faceId ? { 
                 ...f, 
                 sceneData: { ...f.sceneData!, ...data.metadata },
                 panels: newPanels,
                 isVisualized: false,
                 isLoading: false
             } : f));
          } else {
             setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, isLoading: false } : f));
          }
      } catch(e) {
          console.error(e);
          setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, isLoading: false } : f));
      }
  };

  const handleReshootScene = async (faceId: string) => {
      const face = comicFaces.find(f => f.id === faceId); 
      if (!face) return;
      setComicFaces(prev => prev.map(f => f.id === faceId ? { 
          ...f, 
          isLoading: true,
          isVisualized: false,
          panels: f.panels.map(p => ({ ...p, isLoading: true, imageUrl: '', videoUrl: undefined }))
      } : f));
      setTimeout(() => handleGenerateSceneImages(faceId), 100);
  };

  const handleGenerateLastFrame = async (faceId: string, panelId: string) => {
      const face = comicFaces.find(f => f.id === faceId); if(!face) return;
      const panel = face.panels.find(p => p.id === panelId); if(!panel) return;
      setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, panels: f.panels.map(p => p.id === panelId ? { ...p, isLoading: true } : p) } : f)); 
      try {
          const ai = getAI();
          const planningPrompt = `
            ROLE: Director / Cinematographer.
            TASK: Describe the END FRAME of a video shot, given the START FRAME description.
            START FRAME: "${panel.scene}"
            CONTEXT: The shot lasts about 3-5 seconds. Describe how the action/camera movement resolves.
            OUTPUT: A concise visual description of the final frame.
          `;
          const planRes = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
             model: MODEL_DIRECTOR,
             contents: [
                panel.imageUrl ? { inlineData: { mimeType: 'image/jpeg', data: panel.imageUrl.split(',')[1] } } : { text: "No image ref." },
                { text: planningPrompt }
             ]
          }));
          const endFrameDesc = planRes.text || "";
          const result = await generateLastFrameImage(panel, face.sceneData, endFrameDesc);
          setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, panels: f.panels.map(p => p.id === panelId ? { ...p, lastFrameUrl: result.url, isLoading: false } : p) } : f));
      } catch(e) {
          handleAPIError(e);
          setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, panels: f.panels.map(p => p.id === panelId ? { ...p, isLoading: false } : p) } : f));
      }
  };
  
  const handleRegenerateLastFrame = async (faceId: string, panelId: string) => {
      handleGenerateLastFrame(faceId, panelId);
  };

  const handleAddShot = async (faceId: string, afterPanelId: string) => {
      const face = comicFaces.find(f => f.id === faceId);
      if (!face) return;
      const afterIndex = face.panels.findIndex(p => p.id === afterPanelId);
      if (afterIndex === -1) return;
      const newPanelId = `scene-${face.pageIndex}-p-insert-${Date.now()}`;
      const placeholder: ComicPanelData = {
          id: newPanelId,
          index: afterIndex + 1,
          scene: "Analyzing context & constraints...",
          focus_char: 'none',
          isLoading: true,
          imageUrl: '',
          videoVolume: false
      };
      const updatedPanels = [...face.panels];
      updatedPanels.splice(afterIndex + 1, 0, placeholder);
      updatedPanels.forEach((p, i) => p.index = i);
      setComicFaces(prev => prev.map(f => f.id === faceId ? { ...f, panels: updatedPanels } : f));
      const prevShot = face.panels[afterIndex];
      const nextShot = face.panels[afterIndex + 1]; 
      const nextShotContext = nextShot ? `Next Shot Action: ${nextShot.scene}` : "End of scene.";
      const ai = getAI();
      let targetLangName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage;
      if (selectedLanguage.includes('zh') || selectedLanguage.includes('CN')) targetLangName = "Simplified Chinese (简体中文)";
      let styleConstraint = "";
      if (detectedVisualCategoryRef.current === 'REAL') styleConstraint = "Ensure visual descriptions imply Real World photography.";
      if (detectedVisualCategoryRef.current === '2D') styleConstraint = "Ensure visual descriptions imply 2D Anime/Animation.";
      if (detectedVisualCategoryRef.current === '3D') styleConstraint = "Ensure visual descriptions imply 3D CGI/Game graphics.";
      const prompt = `
      ROLE: Director. TASK: Insert a bridging shot between two shots.
      CONTEXT: 
      - Prev Shot: "${prevShot.scene}" (Focus: ${prevShot.focus_char}).
      - Next Context: ${nextShotContext}.
      CONSTRAINTS (MUST FOLLOW):
      - Setting: ${face.sceneData?.setting}
      - Costume: ${face.sceneData?.costume_rule}
      - Lighting: ${face.sceneData?.lighting}
      - STYLE: ${styleConstraint}
      VISUAL STYLE: ${detectedVisualBaseRef.current || selectedGenre}.
      CHARACTERS: ${heroesRef.current.map((h, i) => `hero-${i} (${h.name})`).join(', ')}.
      REQUIREMENTS:
      1. STRICT CONTINUITY with environment and costume.
      2. Identify the focus character ID (e.g. "hero-0", "hero-1") or "none".
      3. OUTPUT LANGUAGE: ${targetLangName} (STRICTLY).
      OUTPUT JSON: { 
        "scene": "Visual description...", 
        "dialogue": "...", 
        "focus_char": "hero-0", 
        "camera": "...", 
        "lighting": "...", 
        "sound_fx": "..." 
      }
      `;
      try {
          const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ 
              model: MODEL_DIRECTOR, contents: prompt, config: { responseMimeType: 'application/json' } 
          }));
          const data = parseAIResponse(res.text || "{}");
          const resolvedFocus = data.focus_char ? data.focus_char.toLowerCase() : 'none';
          setComicFaces(prev => prev.map(f => {
              if (f.id !== faceId) return f;
              return {
                  ...f,
                  panels: f.panels.map(p => {
                      if (p.id !== newPanelId) return p;
                      return {
                          ...p,
                          scene: data.scene || "Scene bridge...",
                          dialogue: data.dialogue || "",
                          focus_char: resolvedFocus, 
                          camera: data.camera || "",
                          lighting: data.lighting || "",
                          sound_fx: data.sound_fx || "",
                          isLoading: true 
                      };
                  })
              };
          }));
          setTimeout(async () => {
              const result = await generatePanelImage({
                  id: newPanelId,
                  index: afterIndex + 1,
                  scene: data.scene,
                  focus_char: resolvedFocus, 
                  camera: data.camera,
                  lighting: data.lighting,
                  isLoading: true,
                  imageUrl: ''
              }, face.sceneData);
              
              setComicFaces(prev => prev.map(f => f.id === faceId ? {
                  ...f,
                  panels: f.panels.map(p => p.id === newPanelId ? {
                      ...p,
                      imageUrl: result.url,
                      prompt: result.prompt,
                      isLoading: false
                  } : p)
              } : f));
          }, 500);
      } catch (e) {
          console.error("Insert Shot Error", e);
          setComicFaces(prev => prev.map(f => {
             if (f.id !== faceId) return f;
             return { ...f, panels: f.panels.filter(p => p.id !== newPanelId) };
          }));
      }
  };

  const handleRemoveShot = (faceId: string, panelId: string) => {
      setComicFaces(prev => prev.map(f => {
          if (f.id !== faceId) return f;
          const newPanels = f.panels.filter(p => p.id !== panelId);
          newPanels.forEach((p, i) => p.index = i);
          return { ...f, panels: newPanels };
      }));
  };

  const handleAddScene = async (afterFaceId: string) => {
      const index = comicFaces.findIndex(f => f.id === afterFaceId);
      if (index === -1) return;
      const newSceneId = `scene-insert-${Date.now()}`;
      const prevScene = comicFaces[index];
      const nextScene = comicFaces[index + 1];
      const inheritedSceneData = { 
          setting: "New Scene", 
          lighting: "Cinematic", 
          costume_rule: prevScene.sceneData?.costume_rule || "Consistent", 
          mood: "Neutral",
          anchor_costume_url: prevScene.sceneData?.anchor_costume_url, 
          anchor_environment_url: undefined 
      };
      const newFace: ComicFace = {
          id: newSceneId,
          type: 'story',
          pageIndex: (prevScene.pageIndex || 0) + 1, 
          layout: 'single',
          sceneData: inheritedSceneData,
          panels: [],
          choices: [],
          isLoading: true,
          isVisualized: false
      };
      const updatedFaces = [...comicFaces];
      updatedFaces.splice(index + 1, 0, newFace);
      setComicFaces(updatedFaces);
      const ai = getAI();
      let targetLangName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage;
      if (selectedLanguage.includes('zh') || selectedLanguage.includes('CN')) targetLangName = "Simplified Chinese (简体中文)";
      const prevContext = prevScene.panels.length > 0 ? prevScene.panels[prevScene.panels.length - 1].scene : "Unknown";
      const prevPanel = prevScene.panels.length > 0 ? prevScene.panels[prevScene.panels.length - 1] : null;
      const prevImage = prevPanel?.lastFrameUrl || prevPanel?.imageUrl;
      const nextContext = nextScene && nextScene.panels.length > 0 ? nextScene.panels[0].scene : "End of story";
      let styleConstraint = "";
      if (detectedVisualCategoryRef.current === 'REAL') styleConstraint = "Ensure visual descriptions imply Real World photography.";
      if (detectedVisualCategoryRef.current === '2D') styleConstraint = "Ensure visual descriptions imply 2D Anime/Animation.";
      if (detectedVisualCategoryRef.current === '3D') styleConstraint = "Ensure visual descriptions imply 3D CGI/Game graphics.";
      const prompt = `
      ROLE: Screenwriter. TASK: Create a bridging scene that logically connects the previous scene to the next one.
      PREVIOUS SCENE ENDING: "${prevContext}".
      NEXT SCENE STARTING: "${nextContext}".
      PREMISE: ${customPremise}.
      VISUAL STYLE: ${detectedVisualBaseRef.current}.
      STYLE CONSTRAINT: ${styleConstraint}.
      CHARACTERS: ${heroesRef.current.map(h=>h.name).join(', ')}.
      REQUIREMENT: 
      1. STRICTLY CONTINUE the plot from the Previous Scene.
      2. Bridge the gap to the Next Scene.
      3. Maintain character consistency.
      4. OUTPUT LANGUAGE: ${targetLangName} (STRICTLY).
      OUTPUT JSON: { 
         "metadata": { "setting": "...", "lighting": "...", "costume_rule": "...", "mood": "..." }, 
         "shots": [ 
             { "scene": "...", "dialogue": "...", "focus_char": "hero-0", "camera": "...", "lighting": "...", "sound_fx": "..." },
             { "scene": "...", "dialogue": "...", "focus_char": "hero-0", "camera": "...", "lighting": "...", "sound_fx": "..." }
         ] 
      }
      `;
      try {
          const contents: any[] = [{ text: prompt }];
          if (prevImage) {
               contents.unshift({ inlineData: { mimeType: 'image/jpeg', data: prevImage.split(',')[1] } });
               contents.unshift({ text: "VISUAL CONTEXT (PREVIOUS SCENE END): Use this visual to ensure continuity in lighting and style for the NEW SCENE." });
          }
          const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({ 
              model: MODEL_DIRECTOR, contents: contents, config: { responseMimeType: 'application/json' } 
          }));
          const data = parseAIResponse(res.text || "{}");
          if (data.shots) {
              const newPanels: ComicPanelData[] = data.shots.map((shot: any, idx: number) => ({
                  id: `${newSceneId}-p${idx}`,
                  index: idx,
                  scene: shot.scene,
                  dialogue: shot.dialogue,
                  focus_char: shot.focus_char || 'none',
                  camera: shot.camera,
                  lighting: shot.lighting,
                  sound_fx: shot.sound_fx,
                  isLoading: true,
                  imageUrl: '',
                  videoVolume: false
              }));
              const mergedMetadata = { ...inheritedSceneData, ...data.metadata };
              if (inheritedSceneData.anchor_costume_url) mergedMetadata.anchor_costume_url = inheritedSceneData.anchor_costume_url;
              setComicFaces(prev => prev.map(f => f.id === newSceneId ? { 
                  ...f, 
                  sceneData: mergedMetadata,
                  panels: newPanels,
                  isLoading: false 
              } : f));
          } else {
               setComicFaces(prev => prev.filter(f => f.id !== newSceneId));
          }
      } catch (e) {
          console.error("Add Scene Error", e);
          setComicFaces(prev => prev.filter(f => f.id !== newSceneId));
      }
  };

  const handleUpdateSceneMeta = (faceId: string, field: string, val: string) => {
      setComicFaces(prev => prev.map(f => {
          if (f.id !== faceId || !f.sceneData) return f;
          return { ...f, sceneData: { ...f.sceneData, [field]: val } };
      }));
  }

  // --- NEW HANDLERS FOR SETUP & MUSIC ---

  const handleRecommendConfig = async () => {
      setLoadingAction('recommend');
      const ai = getAI();
      try {
          const prompt = `
          Act as a Creative Director. Recommend a unique, high-quality configuration for a new film project.
          Select from varied genres (Sci-Fi, Fantasy, Noir, etc.).
          Pick a famous director and art style that matches.
          Create a catchy premise.
          Output JSON:
          {
              "genre": "string (one from common film genres)",
              "director": "string",
              "artStyle": "string",
              "refWork": "string",
              "premise": "string",
              "language": "en-US",
              "pageCount": 5,
              "aspectRatio": "16:9"
          }
          `;
          const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
               model: MODEL_DIRECTOR,
               contents: prompt,
               config: { responseMimeType: 'application/json' }
          }));
          const data = parseAIResponse(res.text || "{}");
          if(data.genre) setSelectedGenre(data.genre);
          if(data.director) setSelectedDirector(data.director);
          if(data.artStyle) setSelectedArtStyle(data.artStyle);
          if(data.refWork) setSelectedRefWork(data.refWork);
          if(data.premise) setCustomPremise(data.premise);
          if(data.language) setSelectedLanguage(data.language);
          if(data.pageCount) setSelectedPageCount(data.pageCount);
          if(data.aspectRatio) setSelectedAspectRatio(data.aspectRatio);
      } catch(e) {
          handleAPIError(e);
      } finally {
          setLoadingAction(null);
      }
  };

  const handleInspireOptions = async (type: 'genre' | 'director' | 'art' | 'work'): Promise<string[]> => {
      setLoadingAction(`inspire_${type}`);
      const ai = getAI();
      try {
          const prompt = `Generate 10 creative and distinct options for: ${type.toUpperCase()}. 
          Context: Film creation. Genre context: ${selectedGenre}.
          Return JSON: { "options": ["opt1", "opt2", ...] }`;
          
          const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
               model: MODEL_DIRECTOR,
               contents: prompt,
               config: { responseMimeType: 'application/json' }
          }));
          const data = parseAIResponse(res.text || "{}");
          const opts = data.options || [];
          if(type === 'genre') setDynamicGenres(opts);
          if(type === 'director') setDynamicDirectors(opts);
          if(type === 'art') setDynamicArtStyles(opts);
          if(type === 'work') setDynamicWorks(opts);
          return opts;
      } catch(e) {
          handleAPIError(e);
          return [];
      } finally {
          setLoadingAction(null);
      }
  };

  const handleInspirePremise = async () => {
      setLoadingAction('inspire_premise');
      const ai = getAI();
      try {
          const prompt = `Generate a compelling, unique movie premise (logline).
          Genre: ${selectedGenre}. Director Style: ${selectedDirector}.
          Output JSON: { "premise": "string" }`;
          const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
              model: MODEL_DIRECTOR,
              contents: prompt,
              config: { responseMimeType: 'application/json' }
          }));
          const data = parseAIResponse(res.text || "{}");
          if(data.premise) setCustomPremise(data.premise);
      } catch(e) {
          handleAPIError(e);
      } finally {
          setLoadingAction(null);
      }
  };

  const generateMusicPrompt = async (language: string): Promise<{ title: string, tags: string, lyrics: string }> => {
      const ai = getAI();
      const langName = LYRIC_LANGUAGES.find(l => l.code === language)?.name || language;
      const prompt = `
      Act as a Professional Songwriter and Composer.
      Project: ${selectedGenre} Film. Premise: ${customPremise}.
      Task: Create a song concept.
      1. Title (Creative)
      2. Style Tags (Genre, Mood, Instruments, Tempo - e.g. "Cinematic, Epic, Orchestral, Female Vocals")
      3. Lyrics (Verse 1, Chorus) in ${langName}.
      Output JSON: { "title": "...", "tags": "...", "lyrics": "..." }
      `;
      try {
          const res = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
              model: MODEL_DIRECTOR,
              contents: prompt,
              config: { responseMimeType: 'application/json' }
          }));
          return parseAIResponse(res.text || "{}");
      } catch(e) {
          handleAPIError(e);
          return { title: "Error", tags: "", lyrics: "" };
      }
  };

  const handleSunoGeneration = async (key: string, baseUrl: string, params: { title: string, tags: string, lyrics: string, instrumental: boolean }) => {
      setAudioTrack({ url: "", prompt: params.tags, style: params.tags, lyrics: params.lyrics, title: params.title, isLoading: true });
      setShowSunoDialog(false);

      try {
          const endpoint = '/suno/submit/music';
          const payload: any = {
              prompt: params.lyrics ? params.lyrics : `${params.tags}. ${params.title}`,
              mv: 'chirp-v4',
              title: params.title,
              tags: params.tags
          };

          const res = await fetch(`${baseUrl.replace(/\/+$/, '')}${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}`, 'accept': '*/*' },
              body: JSON.stringify(payload)
          });
          
          if(!res.ok) throw new Error(`Suno API Error: ${res.statusText}`);
          const data = await res.json();
          // Assuming response is an array of clips or a single object with ID
          const clips = Array.isArray(data) ? data : [data];
          if(!clips || clips.length === 0) throw new Error("No clips started.");

          const clipId = clips[0].id;
          
          // Poll for completion
          const pollInterval = setInterval(async () => {
              try {
                  let pollRes = await fetch(`${baseUrl.replace(/\/+$/, '')}/suno/get/music?ids=${clipId}`, { headers: { 'Authorization': `Bearer ${key}` } });
                  if (!pollRes.ok) {
                      pollRes = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/get?ids=${clipId}`);
                  }
                  const pollData = await pollRes.json();
                  const clip = Array.isArray(pollData) ? pollData[0] : pollData;
                  
                  if(clip.status === 'complete' || clip.status === 'streaming') {
                      if(clip.audio_url) {
                          setAudioTrack({ 
                              url: clip.audio_url, 
                              prompt: params.tags, 
                              style: params.tags, 
                              lyrics: params.lyrics || clip.metadata?.prompt, 
                              title: params.title || clip.title,
                              isLoading: false 
                          });
                          if (clip.status === 'complete') clearInterval(pollInterval);
                      }
                  }
                  if(clip.status === 'error') {
                      clearInterval(pollInterval);
                      setAudioTrack(prev => prev ? { ...prev, isLoading: false, error: "Generation Failed" } : undefined);
                      alert("Music Generation Failed");
                  }
              } catch(e) { console.warn("Polling error", e); }
          }, 5000);

      } catch(e) {
          console.error("Suno Start Error", e);
          setAudioTrack(undefined);
          alert("Failed to start music generation.");
      }
  };

  return (
    <>
      {showApiKeyDialog && (
        <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />
      )}
      
      <Setup 
        show={showSetup} 
        isTransitioning={isTransitioning}
        loadingAction={loadingAction}
        heroes={heroes} 
        supports={supports}
        items={items}
        locations={locations}

        selectedGenre={selectedGenre}
        selectedDirector={selectedDirector}
        selectedArtStyle={selectedArtStyle}
        selectedRefWork={selectedRefWork}
        customStylePrompt={customStylePrompt}

        selectedLanguage={selectedLanguage}
        selectedPageCount={selectedPageCount}
        selectedAspectRatio={selectedAspectRatio}
        customPremise={customPremise}
        richMode={richMode}
        uiLang={uiLanguage}
        
        onSetUiLang={setUiLanguage}
        onAddPersona={(t, f, n) => {
            fileToBase64(f).then(b64 => {
                const p = { id: `${t}-${Date.now()}`, base64: b64, desc: t, name: n };
                if (t === 'hero') updateHeroes([...heroesRef.current, p]);
                else updateSupports([...supportsRef.current, p]);
            });
        }}
        onRemovePersona={(t, id) => {
             if (t === 'hero') updateHeroes(heroesRef.current.filter(p => p.id !== id));
             else updateSupports(supportsRef.current.filter(p => p.id !== id));
        }}
        onUpdatePersonaName={handleUpdatePersonaName}
        
        onAddItem={(f, n) => {
             fileToBase64(f).then(b64 => {
                 const it = { id: `item-${Date.now()}`, base64: b64, name: n };
                 updateItems([...itemsRef.current, it]);
             });
        }}
        onRemoveItem={(id) => updateItems(itemsRef.current.filter(i => i.id !== id))}
        
        onAddLocation={(f, n) => {
            fileToBase64(f).then(b64 => {
                const l = { id: `loc-${Date.now()}`, base64: b64, name: n };
                updateLocs([...locsRef.current, l]);
            });
       }}
       onRemoveLocation={(id) => updateLocs(locsRef.current.filter(i => i.id !== id))}

        onGenreChange={setSelectedGenre}
        onDirectorChange={setSelectedDirector}
        onArtStyleChange={setSelectedArtStyle}
        onRefWorkChange={setSelectedRefWork}
        onCustomStyleChange={setCustomStylePrompt}
        onLanguageChange={setSelectedLanguage}
        onPageCountChange={setSelectedPageCount}
        onAspectRatioChange={setSelectedAspectRatio}
        onVideoModelChange={setSelectedVideoModel}
        selectedVideoModel={selectedVideoModel}
        onPremiseChange={setCustomPremise}
        onRichModeChange={setRichMode}
        onLaunch={handleLaunch}
        onLoadPreset={loadPreset}
        onSwitchApiKey={() => {
            localStorage.removeItem('infinite_heroes_projects');
            window.location.reload();
        }}
        
        onRecommendConfig={handleRecommendConfig}
        onInspireOptions={handleInspireOptions}
        onInspirePremise={handleInspirePremise}
        dynamicGenres={dynamicGenres}
        dynamicDirectors={dynamicDirectors}
        dynamicArtStyles={dynamicArtStyles}
        dynamicWorks={dynamicWorks}
      />

      {isTransitioning && <LoadingFX status={loadingStatus} progress={loadingProgress} />}

      {isStarted && viewMode === 'list' && (
          <Book 
             comicFaces={comicFaces} 
             currentSheetIndex={currentSheetIndex} 
             isStarted={isStarted} 
             isSetupVisible={showSetup}
             viewMode='list'
             uiLang={uiLanguage}
             onSheetClick={setCurrentSheetIndex}
             onChoice={(idx, c) => {}}
             onOpenBook={() => {}}
             onDownload={exportProjectAsZip}
             onReset={() => {
                 if(confirm("Exit project? Unsaved progress will be lost.")) {
                     window.location.reload();
                 }
             }}
             onRegeneratePanel={handleRegeneratePanel}
             onRegenerateLastFrame={handleRegenerateLastFrame}
             onUpdatePanel={handleUpdatePanel}
             onUpdateAnchor={handleUpdateAnchor}
             onUpdateExtraAnchor={handleUpdateExtraAnchor}
             onSaveProject={handleSaveProjectToFile}
             onLoadProject={handleLoadProjectFromFile}
             onGenerateVideo={generateVeoClip}
             onGenerateSceneImages={handleGenerateSceneImages}
             onRewriteScene={handleRewriteScene}
             onReshootScene={handleReshootScene}
             onDeleteScene={handleDeleteScene}
             onGenerateLastFrame={handleGenerateLastFrame}
             onAddShot={handleAddShot}
             onRemoveShot={handleRemoveShot}
             onDeletePanelImage={handleDeletePanelImage}
             onAddScene={handleAddScene}
             onUpdateSceneMeta={handleUpdateSceneMeta}
             onRegenerateAnchor={handleRegenerateSingleAnchor}
             onOpenVideoEditor={() => setViewMode('editor')}
             onOpenMusic={() => setShowSunoDialog(true)}
          />
      )}
      
      {isStarted && viewMode === 'editor' && (
          <VideoEditor 
            faces={comicFaces}
            audioTrack={audioTrack}
            aspectRatio={selectedAspectRatio}
            onGenerateMusic={() => setShowSunoDialog(true)}
            onBack={() => setViewMode('list')}
            onExport={exportProjectAsZip}
            onSettings={() => {}}
            onTogglePanelAudio={togglePanelAudio}
          />
      )}
      
      {showSunoDialog && (
          <SunoDialog 
              onConfirm={handleSunoGeneration}
              onCancel={() => setShowSunoDialog(false)}
              onGetInspiration={generateMusicPrompt}
          />
      )}
    </>
  );
};

export default App;
