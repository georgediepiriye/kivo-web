import { Hash } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StepBasics = ({ formData, updateForm, categories }: any) => {
  return (
    <div className="bg-white p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
      <div className="space-y-6">
        {/* Move Name Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400">
            Move Name
          </label>
          <input
            type="text"
            placeholder="Title..."
            value={formData.title}
            onChange={(e) => updateForm("title", e.target.value)} // Use updateForm here
            className="w-full text-xl md:text-2xl p-6 bg-gray-50 rounded-[24px] outline-none font-black border-2 border-transparent focus:border-[#715800]"
          />
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400">
            Description
          </label>
          <textarea
            placeholder="The vibe..."
            value={formData.description}
            onChange={(e) => updateForm("description", e.target.value)} // Use updateForm here
            className="w-full p-6 bg-gray-50 rounded-[24px] h-40 outline-none font-medium text-lg resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400">
            Tags
          </label>
          <input
            placeholder="music, outdoor, networking (separate with commas)"
            value={formData.tags}
            onChange={(e) => updateForm("tags", e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm border border-transparent focus:border-[#715800]"
          />
        </div>

        {/* Category Buttons */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-gray-400">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat: string) => (
              <button
                key={cat}
                type="button" // Good practice to prevent accidental submits
                onClick={() => updateForm("category", cat)} // Use updateForm here
                className={`px-4 py-2 rounded-2xl text-[10px] font-bold border-2 transition-all ${
                  formData.category === cat
                    ? "border-[#715800] bg-[#715800]/5 text-[#715800]"
                    : "border-gray-50 text-gray-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
