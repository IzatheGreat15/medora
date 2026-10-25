
import {
    Building2,
    CarFront,
    Check,
    Clock3,
    MapPin,
} from 'lucide-react';

import type { Branch } from '@/lib/booking/types';

type BranchStepProps = {
    branches: Branch[];
    selectedId: string;
    onSelect: (id: string) => void;
};

export default function BranchStep({
    branches,
    selectedId,
    onSelect,
}: BranchStepProps) {
    return (
        <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Step 1 of 6
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Choose a branch
            </h1>

            <p className="mt-2 text-slate-500">
                Select the clinic location that works best for you.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {branches.map((branch) => {
                    const selected = selectedId === branch.id;

                    return (
                        <button
                            key={branch.id}
                            type="button"
                            onClick={() => onSelect(branch.id)}
                            aria-pressed={selected}
                            className={`relative flex min-w-0 flex-col items-start rounded-2xl border p-4 text-left transition sm:p-5 ${selected
                                    ? 'border-2 border-[#176B55] bg-[#F0F8F3]'
                                    : 'border-slate-200 bg-white hover:border-[#82A995] hover:shadow-sm'
                                }`}
                        >
                            <span
                                className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border ${selected
                                    ? 'border-[#176B55] bg-[#176B55] text-white'
                                    : 'border-slate-300 text-transparent'
                                    }`}
                            >
                                <Check size={14} />
                            </span>

                            <div className="mt-0 mb-5 flex h-16 w-16 self-start items-center justify-center rounded-2xl bg-[#DDF3E7] text-[#176B55] sm:h-20 sm:w-20">
                                <Building2 size={36} strokeWidth={1.5} />
                            </div>

                            <h2 className="break-words font-semibold text-slate-900">
                                {branch.name}
                            </h2>

                            <p className="mt-1 min-h-10 break-words text-sm leading-5 text-slate-500">
                                {branch.address}
                            </p>

                            <div className="mt-4 space-y-3 text-sm text-slate-600">
                                <p className="flex items-start gap-2">
                                    <Clock3
                                        size={16}
                                        className="mt-0.5 shrink-0 text-[#176B55]"
                                    />
                                    <span>{branch.hours}</span>
                                </p>

                                {branch.amenities.map((item) => (
                                    <p key={item} className="flex items-start gap-2">
                                        <CarFront
                                            size={16}
                                            className="mt-0.5 shrink-0 text-[#176B55]"
                                        />
                                        <span>{item}</span>
                                    </p>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>

            <p className="mt-5 rounded-xl bg-[#F0F8F3] px-4 py-3 text-sm leading-5 text-[#315F50]">
                You can choose a service and practitioner available at this branch in
                the next steps.
            </p>
        </section>
    );
}
