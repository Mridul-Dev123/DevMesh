import ApiError from '../core/ApiError.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const parseInteger = (value) => {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value !== 'string' || !/^-?\d+$/.test(value)) return null;
  return Number(value);
};

const failValidation = (errors) =>
  new ApiError(400, 'Validation failed', {
    code: 'VALIDATION_ERROR',
    errors,
  });

const validateRequest = (validator) => (req, _res, next) => {
  const errors = validator(req);
  if (errors.length > 0) {
    return next(failValidation(errors));
  }
  return next();
};

const validateUuidParam = (paramName) =>
  validateRequest((req) => {
    const value = req.params?.[paramName];
    if (typeof value !== 'string' || !UUID_REGEX.test(value)) {
      return [{ field: paramName, message: `${paramName} must be a valid UUID` }];
    }
    return [];
  });

const validatePageLimitQuery = ({ maxLimit = 100 } = {}) =>
  validateRequest((req) => {
    const errors = [];
    const page = req.query?.page;
    const limit = req.query?.limit;

    if (page !== undefined) {
      const parsed = parseInteger(page);
      if (parsed === null || parsed < 1) {
        errors.push({ field: 'page', message: 'page must be a positive integer' });
      }
    }

    if (limit !== undefined) {
      const parsed = parseInteger(limit);
      if (parsed === null || parsed < 1) {
        errors.push({ field: 'limit', message: 'limit must be a positive integer' });
      } else if (parsed > maxLimit) {
        errors.push({ field: 'limit', message: `limit cannot exceed ${maxLimit}` });
      }
    }

    return errors;
  });

const validateSkipTakeQuery = ({ maxTake = 100 } = {}) =>
  validateRequest((req) => {
    const errors = [];
    const skip = req.query?.skip;
    const take = req.query?.take;

    if (skip !== undefined) {
      const parsed = parseInteger(skip);
      if (parsed === null || parsed < 0) {
        errors.push({ field: 'skip', message: 'skip must be a non-negative integer' });
      }
    }

    if (take !== undefined) {
      const parsed = parseInteger(take);
      if (parsed === null || parsed < 1) {
        errors.push({ field: 'take', message: 'take must be a positive integer' });
      } else if (parsed > maxTake) {
        errors.push({ field: 'take', message: `take cannot exceed ${maxTake}` });
      }
    }

    return errors;
  });

const validateRegisterBody = validateRequest((req) => {
  const errors = [];
  const username = toTrimmedString(req.body?.username);
  const email = toTrimmedString(req.body?.email).toLowerCase();
  const password = req.body?.password;

  if (!username) {
    errors.push({ field: 'username', message: 'username is required' });
  } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    errors.push({
      field: 'username',
      message: 'username must be 3-30 chars and contain only letters, numbers, underscore',
    });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'email is required' });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'email must be valid' });
  }

  if (!isNonEmptyString(password)) {
    errors.push({ field: 'password', message: 'password is required' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'password must be at least 8 characters long' });
  }

  if (errors.length === 0) {
    req.body.username = username;
    req.body.email = email;
  }

  return errors;
});

const validateLoginBody = validateRequest((req) => {
  const errors = [];
  const identifier = toTrimmedString(req.body?.identifier || req.body?.username || req.body?.email);
  const password = req.body?.password;

  if (!identifier) {
    errors.push({
      field: 'identifier',
      message: 'identifier is required (username or email)',
    });
  }

  if (!isNonEmptyString(password)) {
    errors.push({ field: 'password', message: 'password is required' });
  }

  if (errors.length === 0) {
    req.body.identifier = identifier;
  }

  return errors;
});

const validateProfileUpdateBody = validateRequest((req) => {
  const errors = [];
  const hasFile = Boolean(req.file);
  const payload = req.body ?? {};
  const hasBio = payload.bio !== undefined;
  const hasTechStack = payload.techStack !== undefined;
  const hasAvatarUrl = payload.avatarUrl !== undefined;

  if (!hasFile && !hasBio && !hasTechStack && !hasAvatarUrl) {
    errors.push({ field: 'body', message: 'At least one updatable field is required' });
  }

  if (hasBio) {
    const bio = toTrimmedString(payload.bio);
    if (bio.length > 160) {
      errors.push({ field: 'bio', message: 'bio cannot exceed 160 characters' });
    } else {
      req.body.bio = bio;
    }
  }

  if (hasTechStack) {
    const techStack = payload.techStack;
    if (!Array.isArray(techStack) && typeof techStack !== 'string') {
      errors.push({
        field: 'techStack',
        message: 'techStack must be an array of strings or a comma-separated string',
      });
    }
  }

  if (hasAvatarUrl && payload.avatarUrl !== null && typeof payload.avatarUrl !== 'string') {
    errors.push({ field: 'avatarUrl', message: 'avatarUrl must be a string or null' });
  }

  return errors;
});

const validateCreatePostBody = validateRequest((req) => {
  const errors = [];
  const content = toTrimmedString(req.body?.content);

  if (!content) {
    errors.push({ field: 'content', message: 'content is required' });
  } else if (content.length > 500) {
    errors.push({ field: 'content', message: 'content cannot exceed 500 characters' });
  }

  if (req.body?.codeSnippet !== undefined && req.body?.codeSnippet !== null) {
    if (typeof req.body.codeSnippet !== 'string') {
      errors.push({ field: 'codeSnippet', message: 'codeSnippet must be a string' });
    }
  }

  if (req.body?.language !== undefined && req.body?.language !== null) {
    if (typeof req.body.language !== 'string') {
      errors.push({ field: 'language', message: 'language must be a string' });
    } else if (req.body.language.trim().length > 60) {
      errors.push({ field: 'language', message: 'language cannot exceed 60 characters' });
    }
  }

  if (errors.length === 0) {
    req.body.content = content;
    if (typeof req.body.language === 'string') {
      req.body.language = req.body.language.trim();
    }
  }

  return errors;
});

const validateUpdatePostBody = validateRequest((req) => {
  const errors = [];
  const payload = req.body ?? {};
  const hasContent = payload.content !== undefined;
  const hasCodeSnippet = payload.codeSnippet !== undefined;
  const hasLanguage = payload.language !== undefined;

  if (!hasContent && !hasCodeSnippet && !hasLanguage) {
    errors.push({
      field: 'body',
      message: 'At least one field is required: content, codeSnippet, language',
    });
  }

  if (hasContent) {
    if (payload.content !== null && typeof payload.content !== 'string') {
      errors.push({ field: 'content', message: 'content must be a string' });
    } else if (typeof payload.content === 'string') {
      const content = payload.content.trim();
      if (!content) {
        errors.push({ field: 'content', message: 'content cannot be empty' });
      } else if (content.length > 500) {
        errors.push({ field: 'content', message: 'content cannot exceed 500 characters' });
      } else {
        req.body.content = content;
      }
    }
  }

  if (hasCodeSnippet && payload.codeSnippet !== null && typeof payload.codeSnippet !== 'string') {
    errors.push({ field: 'codeSnippet', message: 'codeSnippet must be a string or null' });
  }

  if (hasLanguage && payload.language !== null && typeof payload.language !== 'string') {
    errors.push({ field: 'language', message: 'language must be a string or null' });
  }

  return errors;
});

const validateCreateCommentBody = validateRequest((req) => {
  const content = toTrimmedString(req.body?.content);
  const errors = [];

  if (!content) {
    errors.push({ field: 'content', message: 'content is required' });
  } else if (content.length > 280) {
    errors.push({ field: 'content', message: 'content cannot exceed 280 characters' });
  }

  if (errors.length === 0) {
    req.body.content = content;
  }

  return errors;
});

const validateSendMessageBody = validateRequest((req) => {
  const content = toTrimmedString(req.body?.content);
  const errors = [];

  if (!content) {
    errors.push({ field: 'content', message: 'content is required' });
  } else if (content.length > 1000) {
    errors.push({ field: 'content', message: 'content cannot exceed 1000 characters' });
  }

  if (errors.length === 0) {
    req.body.content = content;
  }

  return errors;
});

export {
  validateCreateCommentBody,
  validateCreatePostBody,
  validateLoginBody,
  validatePageLimitQuery,
  validateProfileUpdateBody,
  validateRegisterBody,
  validateRequest,
  validateSendMessageBody,
  validateSkipTakeQuery,
  validateUpdatePostBody,
  validateUuidParam,
};
