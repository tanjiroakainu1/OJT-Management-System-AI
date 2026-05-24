import {
  getRequirementDisplayName,
  isImageDataUrl,
  isPdfDataUrl,
  isRequirementDataUrl,
} from '../lib/fileUpload';

export function RequirementFileLink({
  filePath,
  fileName,
  className = '',
}: {
  filePath: string;
  fileName?: string | null;
  className?: string;
}) {
  const label = getRequirementDisplayName(fileName, filePath);

  if (!isRequirementDataUrl(filePath)) {
    return <span className={`text-sm text-zinc-500 ${className}`}>{label}</span>;
  }

  return (
    <a
      href={filePath}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName ?? undefined}
      className={`text-sm link-action ${className}`}
    >
      {label}
    </a>
  );
}

export function RequirementFilePreview({
  filePath,
  fileName,
}: {
  filePath: string;
  fileName?: string | null;
}) {
  const label = getRequirementDisplayName(fileName, filePath);

  if (!isRequirementDataUrl(filePath)) {
    return (
      <p className="text-xs text-zinc-500">
        {label} <span className="italic text-zinc-600">(demo entry — re-upload to attach a file)</span>
      </p>
    );
  }

  if (isImageDataUrl(filePath)) {
    return (
      <div className="mt-2">
        <img
          src={filePath}
          alt={label}
          className="max-h-40 rounded border border-violet-550/60 object-contain"
        />
        <RequirementFileLink filePath={filePath} fileName={fileName} className="mt-1 inline-block" />
      </div>
    );
  }

  if (isPdfDataUrl(filePath)) {
    return (
      <div className="mt-2">
        <RequirementFileLink filePath={filePath} fileName={fileName} />
        <iframe
          title={label}
          src={filePath}
          className="mt-2 h-48 w-full rounded border border-violet-550/60 bg-halloween-void"
        />
      </div>
    );
  }

  return <RequirementFileLink filePath={filePath} fileName={fileName} />;
}
