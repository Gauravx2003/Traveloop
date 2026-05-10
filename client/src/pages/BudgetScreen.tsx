import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import {
  Loader2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface BudgetData {
  totalCost: number;
  averagePerDay: string;
  breakdown: { category: string; total: number }[];
}

interface Trip {
  id: number;
  name: string;
  totalBudget: string;
}

const COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
];

const BudgetScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const [budgetRes, tripRes] = await Promise.all([
          api.get(`/trips/budget/${id}`),
          api.get(`/trips/itinerary/${id}`),
        ]);
        setBudgetData(budgetRes.data);
        setTrip(tripRes.data);
      } catch (err) {
        setError("Failed to load budget data");
      } finally {
        setLoading(false);
      }
    };
    fetchBudget();
  }, [id]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-indigo-600">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error || !budgetData || !trip) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl">
        {error || "Data not found"}
      </div>
    );
  }

  const targetBudget = Number(trip.totalBudget) || 0;
  const isOverBudget = targetBudget > 0 && budgetData.totalCost > targetBudget;
  const percentageUsed =
    targetBudget > 0
      ? Math.min((budgetData.totalCost / targetBudget) * 100, 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <Link
        to={`/trips/${id}/itinerary`}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Itinerary
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-2.5 rounded-xl">
            <PieChartIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {trip.name} Budget Breakdown
            </h1>
            <p className="text-sm text-gray-500">
              Track your spending and stay on target.
            </p>
          </div>
        </div>

        {/* Budget Alerts */}
        {targetBudget > 0 ? (
          <div
            className={`mb-8 p-4 rounded-2xl border ${isOverBudget ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
          >
            <div className="flex items-start gap-3">
              {isOverBudget ? (
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
              )}
              <div className="w-full">
                <h3
                  className={`font-bold ${isOverBudget ? "text-red-900" : "text-green-900"}`}
                >
                  {isOverBudget ? "Over Budget Alert" : "On Track"}
                </h3>
                <p
                  className={`text-sm mt-1 ${isOverBudget ? "text-red-700" : "text-green-700"}`}
                >
                  {isOverBudget
                    ? `You are over your target budget of ₹${targetBudget.toLocaleString()} by ₹${(budgetData.totalCost - targetBudget).toLocaleString()}. Consider reviewing your activities.`
                    : `You have spent ₹${budgetData.totalCost.toLocaleString()} of your ₹${targetBudget.toLocaleString()} budget.`}
                </p>

                {/* Progress Bar */}
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${isOverBudget ? "bg-red-500" : "bg-green-500"}`}
                    style={{ width: `${percentageUsed}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 rounded-2xl border bg-blue-50 border-blue-200 text-blue-800 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-500" /> No target budget
            set for this trip. Update the trip to set a budget.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Key Metrics */}
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Total Cost
              </p>
              <h2 className="text-4xl font-black text-gray-900">
                ₹{" "}
                {budgetData.totalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </h2>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
                  Average Per Day
                </p>
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-black text-indigo-900">
                ₹{" "}
                {Number(budgetData.averagePerDay).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </h2>
            </div>
          </div>

          {/* Recharts Pie Chart */}
          <div className="h-64 w-full">
            {budgetData.breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData.breakdown.map((item) => ({
                      ...item,
                      total: Number(item.total),
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="category"
                  >
                    {budgetData.breakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                No activities with cost yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetScreen;
