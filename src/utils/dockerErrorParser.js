import { logger } from './logger';

// Regex patterns voor verschillende error formats
const ERROR_PATTERNS = {
  NODEJS: /(?:Error|TypeError|ReferenceError|SyntaxError):\s*(.*?)\s*(?:at\s+(.+?):(\d+):(\d+))?/,
  DOCKER: /\[Error\]\s*(.+?):\s*(.*)/,
  NPM: /npm ERR!\s*(.*)/,
  GENERAL: /error:/i
};

// Parse error message en extracteer relevante informatie
function parseErrorMessage(message) {
  // Verwijder ANSI color codes
  message = message.replace(/\x1B\[\d+m/g, '');
  
  for (const [type, pattern] of Object.entries(ERROR_PATTERNS)) {
    const match = message.match(pattern);
    if (match) {
      switch (type) {
        case 'NODEJS':
          return {
            type: 'NODEJS_ERROR',
            message: match[1],
            fileName: match[2] || 'unknown',
            line: parseInt(match[3]) || 0,
            column: parseInt(match[4]) || 0,
            original: message
          };
        case 'DOCKER':
          return {
            type: 'DOCKER_ERROR',
            message: match[2],
            service: match[1],
            fileName: 'docker-compose.prod.yml',
            line: 0,
            column: 0,
            original: message
          };
        case 'NPM':
          return {
            type: 'NPM_ERROR',
            message: match[1],
            fileName: 'package.json',
            line: 0,
            column: 0,
            original: message
          };
        default:
          return {
            type: 'UNKNOWN_ERROR',
            message: message,
            fileName: 'unknown',
            line: 0,
            column: 0,
            original: message
          };
      }
    }
  }
  return null;
}

// Format error voor Windsurf Problems venster
function formatWindsurfError(error) {
  if (!error) return null;
  
  // Voeg reparatie suggestie toe
  const suggestion = generateRepairSuggestion(error);
  const repairCommand = suggestion ? ` [REPAIR: ${suggestion}]` : '';
  
  return `[${error.type}] ${error.fileName}:${error.line}:${error.column} - ${error.message}${repairCommand}`;
}

// Genereer reparatie suggestie gebaseerd op error type
function generateRepairSuggestion(error) {
  switch (error.type) {
    case 'NODEJS_ERROR':
      return `cascade fix "${error.fileName}" --line ${error.line}`;
    case 'DOCKER_ERROR':
      return `cascade fix-docker "${error.service}"`;
    case 'NPM_ERROR':
      return `cascade fix-npm`;
    default:
      return null;
  }
}

// Monitor Docker logs en stuur errors naar Windsurf
export function monitorDockerLogs(containerId, serviceName) {
  const logStream = process.stderr;
  
  return {
    write: (data) => {
      const message = data.toString().trim();
      const error = parseErrorMessage(message);
      
      if (error) {
        // Log naar stderr voor Windsurf probleem detectie
        const windsurfError = formatWindsurfError(error);
        if (windsurfError) {
          logStream.write(`${windsurfError}\n`);
          
          // Log ook naar onze applicatie logger
          logger.error(error.message, {
            error: {
              ...error,
              containerId,
              serviceName
            }
          });
        }
      }
      
      // Schrijf originele bericht ook
      logStream.write(`${data}`);
    }
  };
}

export default {
  parseErrorMessage,
  formatWindsurfError,
  monitorDockerLogs
};
