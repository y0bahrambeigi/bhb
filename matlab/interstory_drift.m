function drift=interstory_drift(u,story_heights)
story_heights=story_heights(:).';
if size(u,2)~=numel(story_heights),error('story_heights must match floors.');end
rel=[u(:,1),diff(u,1,2)];drift=rel./story_heights;
end
